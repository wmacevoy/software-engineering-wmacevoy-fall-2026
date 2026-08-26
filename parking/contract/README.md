# contract — shared specification

**Layer 0. Depends on nothing.** Everything else may depend on this; it depends on no one, including
no npm packages.

The agreed shape of every interface in the system. It exists so that two people can build the sensor
and the collector without talking to each other, and so that "is this a breaking change?" (`V-4`) is
a question a script can answer rather than an argument.

```
contract/
  schemas/       JSON Schema for every payload          — language-neutral, so a sensor
  openapi/       the sensor API, per version              in any language can conform (T-4)
  signing.js     the ordered signing strings            — the piece that must be byte-identical
  errors.js      the closed set of codes (V-5, V-6)
  versions.js    supported versions and negotiation (V-3)
```

## Why there is code here at all

Schemas are data, and data cannot prevent the failure that matters most: two implementations
building the *same* signing string differently. A signature is taken over an exact sequence of
bytes, so `signing.js` is a reference implementation rather than a description, and it refuses the
three ways the bytes drift apart:

- a value containing the separator, which would shift field boundaries so that a signature over one
  set of values verifies against another
- a number that is not an integer, whose text form is not agreed
- a timestamp missing its milliseconds — `2026-08-26T14:03:11Z` and `...11.000Z` are the same
  instant and two different signing strings

`DESIGN.md` says we avoid canonical JSON because encoders disagree invisibly. That reasoning applies
to *values* as much as to structure, which is what these checks are for.

## Choices worth knowing

**JSON, not YAML, for the OpenAPI document.** Less pleasant to read, but `JSON.parse` is built in
and `js-yaml` is a dependency. The folder is already JSON Schema, so this is also the consistent
choice.

**No schema validator here yet.** Nothing consumes these schemas at runtime so far. When `cli/`
lands and needs to validate, that is when a validator earns its place — adding one now would be
speculative structure, and the schemas are useful to humans and to future code either way.

**No package.json.** Runtime dependencies live with each service so that an image copies only what
it runs. Tests use `node:test`, which is built in.

## Open: enrollment is not in `v1`

`DESIGN.md` has a device publish its public key and a one-time enrollment code at an unauthenticated
`GET /enroll-request`. That conflicts with `A-3` ("unauthenticated requests are refused on every
endpoint"), and worse, it defeats its own purpose: anyone who can reach the sensor before the admin
does can read the code and enroll a device the admin never saw — the exact attack the code exists to
prevent.

The ordinary fix is that the code is **pre-shared** rather than served: written into the device at
provisioning time, printed on the box, scanned from a label. Enrollment is deliberately left out of
`openapi/sensor.v1.json` until that is decided, rather than specifying something known to be wrong.

Discharges: `V-1`, `V-4`, `V-5`, `V-6`, `T-4`.

**Status: implemented.** 18 tests, `npm test` from `parking/`.
