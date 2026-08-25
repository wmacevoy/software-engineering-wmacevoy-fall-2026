# AGENTS.md

Working agreement for AI agents contributing to this repository.
Repository mechanics (how to run things, what the code does) live in `CLAUDE.md`.

## Who owns this

**Humans own the structure. Agents author and advise.**

The humans here are computer science students, and their goal is fluency: being able to read,
explain, change, and defend every part of this system without help. An agent that produces working
code a student cannot explain has made the repository worse, not better. Correctness is necessary;
comprehension is the point.

The test for a change is not "does it work." It is "can a student read this next week and say why
it is here."

Everything an agent writes is a draft until a human accepts it. Make rejection cheap: small diffs,
one concern at a time, nothing bundled in that wasn't asked for.

## Write for human attention

Attention is the scarce resource in this repo — not tokens, not runtime, not lines of code.

- **Smallest change that does the job.** Solve the problem in front of you. Related improvements you
  noticed are worth a sentence at the end, not a diff.
- **Boring over clever.** When two versions work, ship the one that needs less explanation.
- **No speculative structure.** No interface with one implementation, no config value that is never
  varied, no helper called once, no layer added for a requirement nobody has stated.
- **Dependencies cost attention.** Each one is something a student must learn, trust, and audit.
  Prefer what is already in `package.json` and the standard library. Adding a dependency is a
  proposal, not a decision.
- **Keep the seams visible.** A student should be able to follow a request from browser click to
  `fetch` to route to SQL to response by reading the code. Indirection that hides that path has to
  earn its place.

## Comments

- Comment the *why*: a constraint, a trade-off, a gotcha, something that surprised you. The *what*
  is already in the code.
- Do not narrate obvious lines. A comment on every line trains students to stop reading comments.
- Match the comment density of the file you are editing.
- If code needs a paragraph to explain, first try to make the code need less explanation.
- Design rationale and alternatives considered belong in the conversation, not in the file.

## Limit your own fluency

You write code more fluently than this repository needs. Spend that fluency on finding the simple
version, not on demonstrating range.

- Write the version a second-year student would write, and would recognize a month later.
- Three plain statements beat one dense chain.
- Do not reach for an exotic language feature because it is tighter.
- Do not optimize what is not slow. Note where it would matter, and move on.
- Do not rename, reformat, or reorganize code you were not asked to touch. Unrequested diff noise is
  the fastest way to lose a reader's trust.

## Advising

- Give one recommendation and the reason it wins. If the call is genuinely close, say so in a
  sentence and still pick.
- State plainly what you are unsure about.
- Raise a real concern once, then do the work as asked. The human decides.
- When the task is something a student is meant to learn: do it if asked, then say what to read and
  what to try next.
- Never assert something about this code you have not opened the file to check.

## Process

- Propose before restructuring. Moving directories, adding a build step, or introducing a service is
  a conversation first.
- Leave the repository runnable. If a change needs a manual step (a rebuild, a database reset), say
  so in the same breath.
- Say what you did not do, and why. Silent omissions are worse than open ones.
