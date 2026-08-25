# app — service

**Layer 2.** Depends on `contract`, `identity`, `logger`, `collector`.

The driver-facing web app, the ops troubleshooting UI, and the process that runs the collector.

**This folder holds the original demo, carried over from `attic/parking/` and otherwise unchanged.**
It predates every requirement in `REQUIREMENTS.md` and satisfies almost none of them: it takes
occupancy by push instead of polling, has no device identity, logs with `console.error`, and shows
a count with no indication of how old it is. That gap is the work, not a defect in the documents.

Nearest pieces of work, in order: replace `console.error` with `logger`, add the polling collector,
then make the customer view honest about staleness (`U-1`, `U-2`).

Discharges eventually: `U-1`, `U-2`, `U-3`, `I-3`, `I-4`, `A-1`, `A-3`.
