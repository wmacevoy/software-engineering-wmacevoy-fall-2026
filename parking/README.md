# Parking

A parking-occupancy system used as a worked example of building software with agents, where the
people building it own the result.

The domain is parking. The actual subject is **provenance**: every claim in the system — a count, a
log entry, a firmware image, a commit — is attributable to a key, and every component can be made
to fail or lie on request so that the handling of it can be seen to work.

| Document          | Answers                       |
| ----------------- | ----------------------------- |
| `REQUIREMENTS.md` | what must be observably true  |
| `DESIGN.md`       | how we intend to achieve it   |
| `../AGENTS.md`    | how agents work here          |
| `../CONTRIBUTING.md` | how a change is accepted   |

## Components

Layer is the dependency rule, enforced by `cli/check-layering.sh`: **a folder may require only from
a strictly lower layer.** Nothing may require a service, because there is no layer 3.

| Folder      | Layer | Kind    | Role                                              | Status |
| ----------- | ----- | ------- | ------------------------------------------------- | ------ |
| `contract/` | 0     | spec    | schemas, signing strings, error codes             | **done** |
| `identity/` | 1     | library | key generation, signing, verification             | —      |
| `logger/`   | 1     | library | structured records, hash chain, buffering         | —      |
| `collector/`| 1     | library | poll, verify, derive `live`/`stale`/`unreachable` | —      |
| `sensor/`   | 2     | service | one per lot; the designated liar                  | —      |
| `app/`      | 2     | service | driver UI, ops UI, runs the collector             | **runs** |
| `journal/`  | 2     | service | append-only log store, no delete route            | —      |
| `time/`     | 2     | service | shared, faultable NTP source                      | —      |
| `cli/`      | 2     | tool    | `parkctl` — ops tool, CI gate, grading harness    | partial |
| `db/`       | —     | data    | migrations and seed                               | **runs** |

Only `contract/`, `app/`, and `db/` are implemented. Everything else is specified, has a README
stating its contract, and is unbuilt. **A gap between the documents and the code is work to be done, not an
error in the documents.**

Two folders exist as libraries rather than services on purpose. `identity/` stays a library because
verification must work without a network hop (`I-5`); making it a service would add a timeout and an
outage that stops everything. `collector/` stays a library because `app/` runs it in-process — but
it gets a folder anyway, so that the interface is real before the network is, and promoting it later
is a compose change rather than a rewrite.

## Running it

```sh
docker compose up --build      # http://localhost:3000
docker compose down -v         # reset; required after any schema change
npm run check                  # dependency rule, then tests
```

Tests use Node's built-in runner and need no install. Every test names the requirement it covers
(`T-3`), so a failure says which promise broke.

Seed logins: `root` / `rootpass`, and `sensor/north` / `sensorpass`. Both belong to the old push
model and are on their way out; see the migration note in `REQUIREMENTS.md`.

## Where this came from

`../attic/parking/` holds the original demo as it arrived, from a programming-languages course. It
still runs on its own. It is kept because the before-picture is worth having: it is competent code
that satisfies almost none of the requirements here, and none of what it is missing would be caught
by a conventional review.
