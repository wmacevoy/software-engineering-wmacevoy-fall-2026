# contract — shared specification

**Layer 0. Depends on nothing.** Everything else depends on this; it depends on no one.

The agreed shape of every interface in the system. It exists so that two people can build the
sensor and the collector without talking to each other, and so `V-4` ("what counts as breaking")
is a question a script can answer rather than an argument.

Holds:

- OpenAPI documents per API version
- JSON Schema for `/reading`, `/health`, log records, and firmware manifests
- the ordered signing-string definitions from `DESIGN.md`
- the closed set of error codes and their retryability (`V-5`, `V-6`)

Discharges: `V-1`, `V-4`, `V-5`, `V-6`, `T-4`.

**Status: not implemented.**
