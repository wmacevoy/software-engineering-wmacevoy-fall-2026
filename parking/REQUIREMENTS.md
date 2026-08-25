# Parking Sensor Layer — Requirements

## The system we are imagining

A city runs several parking lots. Each lot has hardware that counts free spaces. Those counts
accumulate into a mobile web app that tells a driver where to park right now.

This document specifies **observable behavior**: what the system must do, stated so that it stays
true no matter how we build it. Mechanism — keys, formats, algorithms — lives in `DESIGN.md`.
Repository policy lives in `../CONTRIBUTING.md`.

Requirement IDs (`S-1`, `C-2`, …) are stable. Reference them from tests, reviews, and commits.

## Why this layer exists

Everything downstream is easy when sensors answer promptly and truthfully. They will not. Building
this layer with faults and attacks we can switch on forces every consumer to answer questions it
would otherwise skip:

- What do we show when we cannot reach a sensor?
- What do we show when we reached it, but the reading is old?
- What do we do when it reports something impossible?
- What do we do when it reports something plausible that it was not entitled to say?

A system that only works when its inputs behave is not finished. That is the lesson; the parking
app is the excuse.

## Shape

```
                       ┌─────────┐
                       │   NTP   │
                       └────┬────┘
              time          │          time
        ┌───────────────────┼───────────────────┐
        │                   │                   │
  ┌───────────┐                          ┌─────────────┐
  │  sensors  │ ──── poll (HTTP) ──────▶ │  collector  │ ──▶ Postgres ──▶ web app ──▶ driver
  │  (1/lot)  │                          └──────┬──────┘
  └─────┬─────┘                                 │
        │                                       │
        └──────── append ──▶ ┌────────────┐ ◀───┘
                             │ aggregator │
                             └──────┬─────┘
                                    │ read
                                    ▼
                                  ops UI
```

Sensors are servers. The collector polls them. Sensors never call in, except to append log entries.

## Scope decisions

Recorded so they are not relitigated:

- **One sensor per lot** — not per zone, not per space. Per-zone sensing (a lot with one dark zone,
  where capacity is known but the count is not) is a richer problem and deliberately out of scope:
  it splits attention away from the failure-handling goal.
- **Counts, not locations.** A sensor reports how many spaces are free, never which ones.
- **The collector lives in the existing Express app**, not a service of its own. Splitting it out is
  a later lesson, not a starting condition.
- **One sensor image, many containers**, differing only by environment.
- **Push-based firmware updates** through the control plane. Real fleets pull because they sit
  behind NAT; we do not, and pulling would cost a service we do not need.
- **A single signing key**, not a rotation hierarchy. Rotating a trust anchor using only the old
  anchor is genuinely hard and is named as deferred rather than pretended to be easy.

---

## S — The sensor

| Method | Path                | Plane   | Purpose                                 |
| ------ | ------------------- | ------- | --------------------------------------- |
| GET    | `/reading`          | data    | current count                           |
| GET    | `/health`           | health  | proof of life, clock, versions          |
| GET    | `/control/state`    | control | current mode and script position        |
| POST   | `/control/mode`     | control | induce or clear a fault                 |
| POST   | `/control/script`   | control | load a deterministic occupancy sequence |
| POST   | `/control/firmware` | control | offer a signed firmware package         |

**S-1.** `GET /reading` returns `lot_id`, `available`, `capacity`, `status`, `as_of`, and `age_ms`.

**S-2.** `as_of` is the wall-clock time the count was **taken**, not when the request was served. A
sensor whose sensing has frozen keeps returning the old `as_of`. Without this, no consumer can
distinguish a fresh answer from a stale one and every staleness requirement becomes untestable.

**S-3.** `age_ms` is the time since the count was taken, measured from a **monotonic** source that
does not move when the clock is corrected. It is immune to clock skew; `as_of` is not.

**S-4.** `status` is the sensor's assessment of *itself*: `ok` or `degraded`. A sensor must never
report that it is offline. If it can answer, it is not offline — reachability is a conclusion the
consumer draws, never a field in the payload.

**S-5.** `GET /health` reports process liveness, `last_reading_at`, clock synchronization state and
offset, API versions supported, and running firmware version. It answers "is this thing running,"
which is a different question from "is this data any good." A stuck sensor is green here and wrong
in `/reading`, and ops must be able to see both at once.

**S-6.** A sensor knows its own lot and capacity from configuration and reports both. The database
remains authoritative for capacity; a mismatch is a fault, not a correction.

**S-7.** Generated counts are plausible: within `[0, capacity]`, changing by small amounts between
readings — except under a fault mode that says otherwise.

**S-8.** Every reading is signed by the sensor's device key, covering at minimum `lot_id`,
`available`, and `as_of`. Identity attaches to the reading, not to the connection, so a stored
reading can still answer "who said this?" an hour later.

---

## N — Time

**N-1.** All components synchronize against a shared time source that is itself a component of the
system, and therefore can be made to fail.

**N-2.** Every sensor reports its synchronization state — `synced`, `drifting`, or `unsynced` — and
its offset. Time agreement is a runtime observable, not an assumption.

**N-3.** Staleness is computed from `age_ms`, never from `as_of` arithmetic. A sensor with a fast
clock must not be able to make old data look fresh.

**N-4.** The collector stamps its own receipt time on every reading it ingests. Two independent
clocks are what make skew detectable at all.

**N-5.** Disagreement between `age_ms` and `as_of` beyond a threshold marks the sensor degraded and
is logged with both values. If age says two seconds and the timestamp says forty minutes, the clock
is broken, not the data.

---

## I — Identity

**I-1.** Four identities are kept distinct: the **device** (which sensor), the **caller** (admin,
ops, collector), the **release key** (who signed a firmware package), and the **artifact** (which
firmware, by version and content hash). An admin's login must never be the thing that signs a
release.

**I-2.** Each device holds a keypair. The private key is generated on the device and never leaves
it, never appears in an image, and never appears in the repository.

**I-3.** Enrollment is an explicit admin action binding a device public key to a lot. An unenrolled
device is not merely unauthorized — it is unknown, and is reported differently.

**I-4.** Revocation is an admin action that takes effect no later than the next poll. Nothing signed
by a revoked key is accepted afterward, including entries already in flight.

**I-5.** Any stored reading can be verified against the device registry without contacting the
sensor.

**I-6.** Readings from unenrolled or revoked devices are rejected, never written, and recorded in
the audit stream.

**I-7.** No credential, private key, or signing key is committed to the repository or baked into an
image. Public keys and trust anchors may be.

---

## V — Versioning and compatibility

**V-1.** Every endpoint is versioned, and the version is part of the request path.

**V-2.** Sensors advertise the API versions they support in `/health`.

**V-3.** The collector operates correctly against a **mixed-version fleet**. Sensor containers
cannot be upgraded atomically, so version skew is the normal condition rather than an error state.

**V-4.** A change is breaking if it removes a field, narrows a type, tightens validation, or changes
the meaning of an existing value. Adding an optional field is not breaking. A breaking change
requires a new version served alongside the old one.

**V-5.** All errors share one envelope across every endpoint and version.

**V-6.** Every error response is classified retryable or not, and the classification is part of the
contract. `C-6` cannot be written correctly without it, and retrying an authorization failure
forever is the standard way to get this wrong.

**V-7.** Database schema changes apply to an existing database without destroying its data. The
current "recreate the volume" approach is not a migration story and does not survive a versioned
system.

---

## G — Firmware updates

"Firmware update" here means replacing the software a sensor runs, remotely, through its control
plane. The embedded world calls this OTA, for "over the air."

**G-1.** Admins offer a signed package. Sensors never fetch one themselves.

**G-2.** A sensor verifies the signature over the package metadata, and verifies the artifact's
content hash against that metadata, before installing anything.

**G-3.** A sensor refuses any package whose version is at or below its current version. A valid
signature on old software is exactly the shape of a rollback attack, and the signature check alone
does not catch it.

**G-4.** A sensor refuses a package whose declared target does not match it.

**G-5.** Installation is not complete when the bits land. The new version must report healthy within
a bounded window or the sensor reverts to the previous version on its own.

**G-6.** `/health` reports the running version, which slot is active, and the outcome of the last
upgrade attempt, including a revert.

**G-7.** Every upgrade attempt — accepted, refused, installed, reverted — is recorded in the audit
stream with the reason.

---

## A — Access control

| Endpoint            | admin | ops  | collector | sensor |
| ------------------- | ----- | ---- | --------- | ------ |
| `GET /reading`      | yes   | yes  | **yes**   | —      |
| `GET /health`       | yes   | yes  | yes       | —      |
| `GET /control/*`    | yes   | yes  | **no**    | —      |
| `POST /control/*`   | yes   | no   | **no**    | —      |
| append to log       | no    | no   | yes       | **yes** |
| read log            | yes   | yes  | no        | **no** |
| delete log          | **no** | **no** | **no**  | **no** |

**A-1.** Admins change sensors. Ops read them, including the control plane, and change nothing.

**A-2.** The collector's credential must not reach the control plane in either direction. If the
consumer of the data can also break the sensor, fault injection is no longer a fault — it is a
feature of the consumer, and the exercise is pointless.

**A-3.** Unauthenticated requests are refused on every endpoint.

**A-4.** Log access is append-only for producers. A sensor can write its own entries and can neither
read the stream nor alter what it already wrote. A compromised sensor must not be able to erase its
own history.

**A-5.** No principal can delete log entries through any API. Retention is a policy executed out of
band, deliberately outside the reach of anything the system can be talked into doing.

---

## C — The collector

**C-1.** Every sensor call has an explicit timeout.

**C-2.** The timeout is shorter than the poll interval, so a slow sensor cannot cause polls to pile
up behind one another.

**C-3.** One sensor's failure must not delay or block the polling of any other sensor.

**C-4.** Each lot carries a data state derived by the collector, never reported by the sensor:
`live`, `stale`, or `unreachable`.

**C-5.** Values outside `[0, capacity]` are rejected and the lot marked degraded — not silently
clamped, and never written through. Note that `lots` already carries `CHECK (occupancy <=
capacity)`, so a bad reading that reaches the database produces a constraint violation instead of a
handled fault. Validate at the boundary.

**C-6.** Repeated failure against one sensor backs off rather than polling at full rate.

**C-7.** The collector verifies each reading's signature against the device registry before using
it. An unverifiable reading is treated as no reading, not as a reading in doubt.

**C-8.** Every stored reading records the identity of the poll that produced it, so the data can be
traced back to the exchange that created it.

**C-9.** Every derived state records the inputs that produced it. "Marked lot 3 stale: age 47s
exceeded threshold 15s" is auditable; "sensor returned 200" is not.

---

## L — Logging and traceability

**L-1.** Log records are structured, one event per record, with a fixed set of core fields present
on every event.

**L-2.** A trace identifier is generated per poll and propagated to the sensor, so one query returns
both sides of an exchange.

**L-3.** Because the collector polls on its own schedule and a driver reads the database later, a
driver's request is **not** causally downstream of any particular poll. The link is through stored
data, per `C-8`, and the log must preserve it. Call-chain tracing alone cannot recover it.

**L-4.** Derived states, refusals, and rejections are logged with the values that drove them, per
`C-9`.

**L-5.** Severity has a policy, and one rule is counterintuitive: **an injected fault is not an
error.** A sensor that goes down as instructed is expected and handled, and belongs at warning.
Errors are reserved for conditions a human must act on. If the fault modes fill the error log, the
error log becomes noise and stops being read.

**L-6.** Security-relevant events — enrollment, revocation, authorization failure, firmware
activity, mode changes — go to a separate audit stream with its own retention. The audience is
accountability, not debugging.

**L-7.** Credentials, private keys, tokens, and firmware contents are never logged. Key fingerprints
and token subjects are.

**L-8.** Gaps report themselves. A producer that cannot reach the aggregator buffers, drops oldest,
and emits a counted record of what it dropped once it reconnects. An attacker wants a gap that looks
like nothing; every gap must look like something.

**L-9.** The log is tamper-evident, not merely append-only. Removing or altering a record must be
detectable by inspection of the log itself. Write-only access control protects against a compromised
producer; it does nothing about a compromised aggregator, and these are different threat models.

**L-10.** The state of the log is witnessed periodically outside the aggregator. Without an external
witness, an attacker can discard the most recent records and leave a log that is internally
consistent — the same shape as the firmware freeze attack in `F-6`.

**L-11.** The log record schema is an interface with consumers, and is versioned under the same
rules as `V-4`.

**L-12.** State transitions are always recorded; steady-state successful polls are recorded at debug
severity or sampled. Four sensors at a five-second interval generate roughly seventy thousand
events a day, nearly all of them uneventful.

---

## F — Fault and attack injection

Settable per component at startup and at runtime through the control plane.

| Mode       | Behavior                                          | Consumer skill exercised     |
| ---------- | ------------------------------------------------- | ---------------------------- |
| `ok`       | normal operation                                  | —                            |
| `slow`     | answers after a delay exceeding the poll timeout  | timeouts                     |
| `down`     | refuses connections, or accepts and never answers | retry, back-off, degradation |
| `stuck`    | 200 OK, unchanging count, frozen `as_of`          | staleness detection          |
| `wrong`    | values outside `[0, capacity]`                    | validation at the boundary   |
| `flapping` | alternates between extremes each reading          | smoothing, hysteresis        |
| `skewed`   | plausible data, valid signature, clock off by N   | trusting age over timestamp  |

**F-1.** Each mode is independently settable per sensor while the system runs.

**F-2.** `stuck` returns HTTP 200. It catches consumers who treat a successful response as a current
one, and it only works if nothing about the response looks wrong.

**F-3.** `down` is reachable in both flavors — refused and hanging. They fail differently in a
client: one returns immediately, the other only ends at a timeout the consumer had to have set.

**F-4.** `skewed` is the time-domain counterpart of `stuck`: everything verifies, and the conclusion
is still wrong. It must defeat any staleness check built on `as_of`, and must not defeat one built
on `age_ms`.

**F-5.** The time source and the aggregator are faultable too. A system that only degrades correctly
when its infrastructure is healthy has not been tested.

**F-6.** The following attacks are **demonstrable on request**, and each is demonstrated *before*
its defense is built:

| Attack               | What it looks like                              | Defense it motivates    |
| -------------------- | ----------------------------------------------- | ----------------------- |
| forged reading       | plausible count from an unenrolled key          | `S-8`, `I-5`, `C-7`     |
| replayed reading     | a genuine past reading served again             | `S-2`, `N-3`            |
| rollback firmware    | genuinely old, validly signed software          | `G-3`                   |
| tampered log         | a record removed from an unchained log          | `L-9`                   |
| truncated log        | recent records discarded, chain left consistent | `L-10`                  |
| freeze               | updates withheld so a device never learns       | `G-7`, package expiry   |
| unsigned commit      | code in the repository nobody vouched for       | `../CONTRIBUTING.md`    |

Crypto is where students most reliably produce code they cannot explain — a verification call
copied from elsewhere, which is the exact opposite of the goal. Having personally forged the reading
is what makes the signature check mean something. Any mechanism here that cannot be given an attack
demonstration should be reconsidered rather than added.

---

## U — What the driver sees

**U-1.** The customer view distinguishes three cases and never conflates them: a live count, a count
with its age attached, and no usable data at all.

**U-2.** A stale count is never presented as current. Showing "12 spaces" for a reading taken forty
minutes ago is the failure this entire layer exists to prevent.

**U-3.** A lot whose data cannot be trusted — unverifiable signature, revoked device, impossible
value — is presented as unknown rather than omitted. A missing lot reads as "no such lot"; the truth
is "we do not know."

---

## T — Testing and verification

**T-1.** Occupancy sequences are deterministic — an explicit step list or a seeded generator, never
unseeded randomness. Tests assert exact values; flaky tests teach students that flaky tests are
normal.

**T-2.** Integration tests drive faults through the control plane rather than waiting for them: set
`down`, poll, assert the lot goes `unreachable`, set `ok`, assert recovery.

**T-3.** Every requirement above that says "must" has a test that references its ID.

**T-4.** Conformance is checkable from outside: a sensor written by anyone, in any language, can be
verified against this specification without reading its source. The same check runs in continuous
integration and by hand.

**T-5.** One command returns the entire system to a known state. Thirty people need identical
starting conditions, and the current reset is already more than one step.

---

## Non-goals

Per-zone or per-space sensing. Real hardware, radio protocols, or power modeling. Geospatial data,
maps, or navigation. Reservations, payment, or enforcement. Signing key rotation. A production log
pipeline.

## Migration

`POST /api/lots/:id/occupancy` and the `sensor` user role are the old push model, and the role is
superseded by device identity in `I`. Retire both when the collector lands — two ingestion paths
with no clear story is worse than either one alone.
