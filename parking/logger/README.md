# logger — library

**Layer 1.** Depends only on `contract` and `identity`.

Emits structured records, maintains the per-producer hash chain, signs entries, buffers when the
journal is unreachable, and emits the `log.gap` record that makes a gap visible.

Not to be confused with `journal/`, which *stores* what this produces. They sit on opposite sides
of the write-only boundary in `A-4`: this library can only append, and cannot read back or amend.

Discharges: `L-1`, `L-2`, `L-4`, `L-5`, `L-7`, `L-8`, `L-9`, `L-12`.

**Status: not implemented.** Today the code in `app/` calls `console.error` directly, which is a
useful before-picture: unfilterable, unaggregatable, and wrong in no way a conventional review
would catch.
