# collector — library

**Layer 1.** Depends on `contract`, `identity`, `logger`.

Polls sensors, verifies signatures, applies timeouts and back-off, derives `live` / `stale` /
`unreachable`, and writes readings with the trace of the poll that produced them.

A library, not a service, because `app/` runs it in-process — a deliberate scope decision in
`REQUIREMENTS.md`. It lives in its own folder anyway so that the interface is real before the
network is. Promoting it to a container later should be a compose change, not a rewrite.

This is the trust boundary: the sensor produces counts, and this decides whether to believe them.

Discharges: `C-1` through `C-9`, `N-3`, `N-4`, `N-5`.

**Status: not implemented.**
