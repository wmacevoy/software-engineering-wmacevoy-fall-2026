# identity — library

**Layer 1.** Depends only on `contract`.

Key generation, signing, and verification. A library rather than a service on purpose: `I-5`
requires that a stored reading be verifiable without contacting the sensor, and it should not
require contacting an identity service either. A service here would add a network hop, a timeout,
and an outage that stops everything.

Signing and verifying must be byte-identical on both sides of every exchange or signatures fail for
reasons nobody can see. That is what this library is for.

The device *registry* is data, not code — it lives in `db/` and is served by `app/`.

Discharges: `I-2`, `I-5`, `S-8`, `C-7`.

**Status: not implemented.**
