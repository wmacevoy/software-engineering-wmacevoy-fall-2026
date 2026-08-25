# sensor — service

**Layer 2.** One container per lot, all from this image, differing only by `LOT_ID`, `CAPACITY`,
`MODE`, and `SEED`.

Serves readings, answers health, accepts control from admins, and appends its own log entries. It
is also the system's designated liar: every fault and attack in `F` is produced here on request.

Its private key is generated on first boot into a volume and never appears in this folder, in the
image, or in the repository (`I-2`, `I-7`).

Discharges: `S-1` through `S-8`, `F-1` through `F-6`, `G-1` through `G-7`, `N-2`.

**Status: not implemented.** The old push-model sensor role in `app/` is what this replaces; see
the migration note in `REQUIREMENTS.md`.
