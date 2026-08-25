# Parking Sensor Layer — Design

How we intend to satisfy `REQUIREMENTS.md`. Requirements say what must be observably true; this
document picks mechanisms, and every mechanism here is replaceable without renegotiating a
requirement. Where a choice is arguable, the reasoning is recorded so it can be argued with.

Requirement IDs in parentheses mark what a section is discharging.

## Components

| Container    | Count | Role                                                     |
| ------------ | ----- | -------------------------------------------------------- |
| `sensor`     | 1/lot | serves readings, accepts control, appends log entries     |
| `collector`  | 1     | polls sensors, verifies, writes Postgres, appends log     |
| `db`         | 1     | lots, devices, readings, anchors                          |
| `aggregator` | 1     | append-only log store, chain verification, read API       |
| `ntp`        | 1     | shared time source, faultable                             |
| `app`        | 1     | driver-facing web app and ops UI (same Express process)   |

One sensor image; containers differ only by `LOT_ID`, `CAPACITY`, `MODE`, `SEED`, and their key
material volume.

## Cryptography: one algorithm, three jobs

**Ed25519 everywhere** — device identity, log entry signing, firmware manifests. One primitive means
one thing to learn and no parameter choices to get wrong. RSA invites padding mistakes; ECDSA
invites nonce mistakes; Ed25519 has neither surface. Available in Node's `crypto` with no
dependency.

### What gets signed

Signing JSON directly requires canonicalization, and canonical JSON is a well-known source of subtle
bugs: two encoders disagree about key order or number formatting and signatures fail for reasons
nobody can see. We avoid the problem rather than solve it.

**Every signature covers an explicit, ordered, pipe-joined string.** Fields are fixed by version and
never reordered:

```
reading.v1|<lot_id>|<available>|<capacity>|<as_of>|<nonce>
logentry.v1|<seq>|<ts>|<device_id>|<event>|<prev_hash>|<payload_sha256>
manifest.v1|<version>|<target>|<artifact_sha256>|<min_version>|<expires_at>
```

The leading tag prevents a signature valid in one context from being replayed in another. `nonce`
in a reading defeats replay of a genuine past reading (`F-6`). Adding a field means a new tag, which
is the same discipline as `V-4` applied to the signing format.

## Identity (I)

### Keys and enrollment

A sensor generates its keypair on first boot into a volume that is not part of its image
(`I-2`). It exposes the public key and a one-time enrollment code at an unauthenticated
`GET /enroll-request`, available only while unenrolled.

An admin enrolls it against the collector:

```
POST /api/v1/devices  { device_id, public_key, lot_id, enrollment_code }
```

The one-time code prevents an attacker who can reach the network from enrolling a device the admin
never saw. Once enrolled, `/enroll-request` returns 404.

### Registry

```sql
CREATE TABLE devices (
  device_id     TEXT PRIMARY KEY,
  public_key    TEXT NOT NULL,
  lot_id        INTEGER NOT NULL REFERENCES lots(id),
  status        TEXT NOT NULL CHECK (status IN ('enrolled', 'revoked')),
  enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ,
  last_version  TEXT,
  last_seen_at  TIMESTAMPTZ
);
```

Revocation sets `status` and `revoked_at`; nothing is deleted, because the audit trail needs to
outlive the device. The collector reads this table on each poll cycle, which makes revocation
effective within one interval (`I-4`) without a cache to invalidate.

Verification is a local operation against this table (`I-5`) — a stored reading can be checked years
later with no sensor involved.

### Caller identity

Distinct from device identity (`I-1`). Callers present bearer tokens issued by the app; the sensor
verifies them against a shared public key rather than a shared secret, so a compromised sensor
cannot mint admin tokens. The collector's token carries only a `collector` claim and no control
scope (`A-2`).

## Time (N)

A `chrony` container serves all others. It is faultable — it can be stopped, or made to serve an
offset — so `F-5` has something to break.

Sensors take `age_ms` from `process.hrtime.bigint()`, which is monotonic and unaffected by clock
correction, and `as_of` from the wall clock. Both are reported (`S-1`).

The collector estimates skew directly:

```
skew ≈ (receipt_time − as_of) − age_ms
```

Network latency is on the order of milliseconds and the threshold is on the order of seconds, so
latency is ignored deliberately rather than modeled. Beyond threshold, the sensor is marked degraded
and both values are logged (`N-5`). Staleness itself is computed only from `age_ms` (`N-3`), which
is what makes `skewed` survivable.

## API (V)

Versioned paths: `/v1/reading`, `/v1/control/mode`.

**`/health` is not versioned.** It is the discovery endpoint, and a versioned discovery endpoint has
a bootstrap problem — you would need to know the version to ask which versions exist. It returns:

```json
{
  "status": "ok",
  "versions": ["v1"],
  "firmware": { "version": "1.4.0", "slot": "a", "last_upgrade": "ok" },
  "clock": { "state": "synced", "offset_ms": 12 },
  "last_reading_at": "2026-08-25T14:03:11Z"
}
```

The collector reads `versions` and selects the highest it also supports, which is what makes a mixed
fleet ordinary rather than exceptional (`V-3`).

### Error envelope (V-5, V-6)

```json
{ "error": { "code": "reading_out_of_range", "message": "available 512 exceeds capacity 120",
             "retryable": false, "trace_id": "9f2c…" } }
```

`code` is a closed set; `message` is for humans and is never parsed. Retryability is explicit in the
body rather than inferred from the status code, because the inference rules are exactly what people
get wrong.

| Status | Retryable | Typical cause                        |
| ------ | --------- | ------------------------------------ |
| 400    | no        | malformed request                    |
| 401    | no        | missing or invalid credential        |
| 403    | no        | authenticated, not permitted         |
| 404    | no        | unknown lot or device                |
| 409    | no        | version conflict, downgrade refused  |
| 422    | no        | verification failed                  |
| 503    | **yes**   | dependency down, respect `Retry-After` |
| 504    | **yes**   | upstream timeout                     |

## Logging (L)

### Record

JSON Lines to stdout, and appended to the aggregator. Core fields on every record (`L-1`):

```json
{"ts":"2026-08-25T14:03:11.204Z","level":"warn","service":"collector","schema":"1",
 "trace_id":"9f2c…","lot_id":3,"device_id":"snr-3a9…","event":"lot.stale",
 "reason":{"age_ms":47000,"threshold_ms":15000}}
```

`reason` carries the inputs to a decision (`L-4`, `C-9`) — the field exists so that "why" is
structured rather than buried in a message string. `schema` versions the record itself (`L-11`).

Trace IDs are generated per poll by the collector and passed to the sensor as `X-Trace-Id` (`L-2`).
The resulting reading row stores that same `trace_id` (`C-8`), which is the only link between a
driver's request and the poll that produced what they saw (`L-3`).

Levels (`L-5`): `error` means a human must act. An injected fault reaching the collector is `warn` —
expected, handled, and not an emergency. `info` marks state transitions worth a timeline; steady
successful polls are `debug` (`L-12`).

### Chain (L-9)

**Per-producer chains, not one global chain.** A global chain needs a serialization point, which
becomes both a bottleneck and an ordering argument between producers whose clocks disagree — and we
have already established that their clocks disagree. Each producer keeps its own `seq` and
`prev_hash`:

```
hash_n = sha256(prev_hash || seq || ts || device_id || event || sha256(payload))
```

Each entry is signed by the producer's device key, so a compromised aggregator can neither forge nor
silently alter entries attributed to a device. The aggregator rejects an append whose `prev_hash`
does not match the head it holds, and whose `seq` is not exactly one greater — which makes a gap an
immediate, loud error rather than a discovery made later.

### Anchoring (L-10)

Chain heads are written every five minutes to an `anchors` table **and** printed to the aggregator's
stdout, which compose captures into a store the aggregator does not own. Ops records heads
out-of-band as part of the runbook.

This is deliberately modest. It defeats casual truncation, not a determined attacker with access to
every store at once. Saying so is better than implying more.

### Aggregator API

| Method | Path            | Who       | Notes                                 |
| ------ | --------------- | --------- | ------------------------------------- |
| POST   | `/v1/append`    | producers | append only; `prev_hash` must match   |
| GET    | `/v1/entries`   | ops       | filter by trace, device, event, range |
| GET    | `/v1/verify`    | ops       | walk chains, report first break       |
| GET    | `/v1/anchors`   | ops       | recorded heads                        |

There is no delete route at all (`A-5`). Retention is a scheduled job with direct database access,
outside the API surface, so no principal can be talked into erasing history.

**Availability (L-8).** Producers buffer up to 1000 records locally and drop oldest on overflow. On
reconnect the first record appended is `log.gap` carrying the count dropped and the window. A gap
that reports itself is recoverable; a silent one is indistinguishable from an attack.

## Firmware updates (G)

### Package

```
manifest.json   { version, target, artifact_sha256, min_version, created_at, expires_at }
manifest.sig    Ed25519 over the manifest.v1 signing string
artifact.tar.gz the software
```

The **manifest** is signed, not the artifact; the artifact is bound in by hash. This keeps the
signed object small and fixed-shape, and it is why `G-2` verifies in two steps.

The release public key is baked into the sensor image at build time as its trust anchor. The private
key lives outside the repository and outside CI (`I-7`).

### Slots (G-5)

```
/app/slots/a      /app/slots/b      /app/current -> slots/a
```

A supervisor is PID 1 and execs whatever `current` points at. Install writes to the inactive slot,
verifies, flips the symlink, and restarts the child. The supervisor probes `/health` for 30 seconds;
if it does not come back healthy, the symlink flips back and the previous version is restarted. The
outcome is recorded and reported (`G-6`).

The lesson is that a deploy is not finished when the bits land — it is finished when the thing is
healthy, and the system should be the one to notice.

### Refusals (G-3, G-4)

Checked in order, each producing a distinct audit record: signature, artifact hash, target match,
`version > current`, `current >= min_version`, `expires_at` not passed. Version monotonicity is the
one that stops a validly-signed old release, and it is the check that a signature-only
implementation is missing.

## Deferred

Named so they are not mistaken for oversights:

- **Signing key rotation.** Establishing a new trust anchor using only the old one is genuinely
  hard. One key, documented as a limitation.
- **Full framework-grade update security.** Package expiry covers the freeze attack shallowly;
  real fleets use snapshot and timestamp roles with independent keys.
- **mTLS.** Application-layer signatures teach the same concepts without certificate authority
  management. Production would use both.
- **A log pipeline.** stdout plus a bounded query API is enough until someone has felt the absence.
