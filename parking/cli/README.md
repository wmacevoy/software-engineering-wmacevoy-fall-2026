# cli — parkctl

**Layer 2.** Depends on `contract` and the libraries.

One program with three jobs: the tool ops runs by hand, the gate CI runs on every push, and the
harness that grades a sensor somebody else wrote.

That is why it takes `--json`, returns a meaningful exit code, and never prompts. A checker that
always exits zero is decoration.

Because it verifies against `contract/` rather than against our implementation, a sensor written in
any language can be proven conformant without anyone reading its source (`T-4`).

Contains `check-layering.sh`, which enforces the dependency rule in `README.md`.

Discharges: `T-2`, `T-4`, `T-5`.

**Status: not implemented**, apart from the layering check.
