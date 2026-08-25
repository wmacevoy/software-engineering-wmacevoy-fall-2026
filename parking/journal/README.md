# journal — service

**Layer 2.** Depends on `contract`, `logger`, `identity`.

The append-only log store. Accepts entries from producers, rejects any append whose `prev_hash` or
sequence does not continue the chain, verifies chains on request, records anchors, and answers ops
queries.

**It has no delete route, by design** (`A-5`). Retention is a scheduled job with direct database
access, deliberately outside the API, so no principal can be talked into erasing history.

Write-only access control protects against a compromised producer. The hash chain and per-entry
signatures are what protect against a compromised journal — different threat models, and the
distinction is the lesson.

Discharges: `A-4`, `A-5`, `L-9`, `L-10`, `L-11`.

**Status: not implemented.**
