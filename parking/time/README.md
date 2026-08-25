# time — service

**Layer 2.** The shared time source.

Mostly configuration wrapping an NTP daemon, plus the code that makes it *faultable*: `F-5`
requires that it can be stopped or made to serve a deliberate offset. A system that only degrades
correctly when its infrastructure is healthy has not been tested.

Time agreement is what makes `as_of` comparable across components. It is also why `age_ms` exists:
`N-3` computes staleness from a monotonic source precisely so that a broken clock here cannot make
old data look fresh.

Discharges: `N-1`, and the `skewed` half of `F-5`.

**Status: not implemented.**
