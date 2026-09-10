# Essentials: Agents

An agent is an extremely fast writer with no stake in the outcome. It can read the repository, edit
files, run commands, and draft a change in less time than it takes you to read one. Everything in
this sequence so far — the shell, git, secrets, issues, checks, containers, packages — is what
makes that safe to use, and the failure mode of agents is skipping it.

- **The fear it retires:** "I could not have built this in the time I had." And the fear it
  *creates*, which this document is about: "working code nobody can explain."
- **The fence you prove:** An agent-drafted change, reviewed line by line, run, signed by you with
  the `Co-Authored-By` trailer, green in CI, merged through a pull request — and you can explain
  every line of it to a teammate.
- **Before this:** everything else in `essentials/`
- **After this:** `AGENTS.md` and `CONTRIBUTING.md`, which are the working agreement this document
  sets up

## The model

```
  you ──task, with a done sentence──▶ agent ──reads──▶ the repository: CLAUDE.md, the working set, code
   ▲                                    │
   │                                    ├──runs──▶ shell commands, tests, the container (if you allow)
   │                                    │
   └────── a diff, to review ◀──────────┘
   then: you read it, run it, sign it, own it.
```

Three facts decide how to work with one:

- **It arrives knowing nothing and leaves remembering nothing.** Every session starts from the
  repository. Anything not written there — a constraint in your head, a decision in chat — does not
  exist to it, and it will violate that constraint cleanly, with tests, before lunch.
- **It is a K3 factory.** Fluent, confident, plausible, and occasionally wrong is the precise shape
  of erroneous certainty, arriving faster than you can check it. "This should work" is not a run.
- **It is fastest at the bottom of the waterfall** — code, tests, fixtures, migrations, the second
  and third test case — and no help at all at the top, where the work is conversations with people
  and laws. It will normalize a schema in a minute and never ask about the registrar. The
  requirement document is the railing.

## Once per machine

Install Claude Code, which is the agent this course uses; others follow the same shape.

```sh
curl -fsSL https://claude.ai/install.sh | bash          # mac, linux, WSL
```

```powershell
irm https://claude.ai/install.ps1 | iex                  # windows powershell
```

`SHELL.md` told you to read a piped installer before running it. This is one; download it, read it,
then run it. Start the agent inside a repository by typing `claude` there. It works in the
terminal you already have, on the files git already tracks, and it asks before it edits a file or
runs a command. Those prompts are the default mode, and you should stay in it until the habits below
are habits.

## Once per repository

1. **`CLAUDE.md`** is what the agent reads at the start of every session. `/init` drafts one by
   reading the codebase; this repository's says mechanics — how to run things, where things live,
   what the seams are — and its first line points at `AGENTS.md`, the working agreement. Claude Code
   reads `CLAUDE.md`; to make it read `AGENTS.md` mechanically rather than by instruction, put
   `@AGENTS.md` in `CLAUDE.md`.
2. **`AGENTS.md`** says who owns what: humans own the structure, agents author and advise, the
   smallest change that does the job, no speculative structure, dependencies as proposals, comment
   the why. It is the document you will most often quote back to the agent.
3. **The working set is in the repository.** `REQUIREMENTS`, `DESIGN`, `QUEUE`, `FINDINGS`. This is
   the agent's memory. A constraint that lives only in a head is a K2 to the agent.
4. **Permissions, written down.** `.claude/settings.json` in the project says what the agent may
   do without asking, and it is committed and reviewed like anything else:

   ```json
   { "permissions": { "allow": ["Bash(npm test)", "Bash(npm run check)"] } }
   ```

   Allow the things you would run yourself a hundred times a day. Do not allow `git push`.
5. **One command to run and one to reset** (`DOCKER.md`). An agent that cannot run the thing cannot
   check its own claim, and "never let confidence substitute for a run" needs a run to be possible.

## Every day

The loop, and every step of it is one of the earlier essentials:

1. **Write the task as a done sentence, with the ID.** "`C-5`: values outside `[0, capacity]` are
   rejected and the lot marked degraded; a test named `C-5` fails without the change." Vague in,
   vague out. This is the acceptance criterion from `AGILE_VS_WATERFALL.md`, addressed to a machine.
2. **Ask for the smallest diff, one concern.** "Propose before restructuring." "Show me the test
   failing first." "Do not touch files I did not name." The agent will happily produce three
   hundred lines; a diff you cannot review is a diff you cannot sign (`GITHUB-ISSUES.md`).
3. **Read the whole diff.** Not the summary — the diff. If you cannot explain a line to a teammate,
   it does not go in. The line you skipped is the one that added a dependency, reformatted a file
   you did not ask about, or asserted nothing.
4. **Run it.** `npm run check`, the container, the fault you meant to inject. The agent's "this
   should work" is not a run; yours is.
5. **Ask the retro questions.** *What did you assume because nobody wrote it down? What did you have
   to read that you should not have needed?* Put the answers in the repository — `CLAUDE.md`, a
   README, `FINDINGS` — where the next session, human or not, will find them.
6. **Commit it yourself, with the trailer, and sign it.**

   ```
   C-5: reject out-of-range readings at the boundary

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

   The agent does not commit unless asked, and you should not ask. Your signature says *I have read
   this and I stand behind it*; the trailer says who drafted it. Both are true, and they are
   different claims.
7. **Open the pull request**, and let the reviewer ask the three questions. The reviewer treats an
   agent-drafted change exactly like any other, which is the point of having reviewed it yourself
   first.

### What to hand it, and what not to

| Hand it                                                          | Keep                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| the second and third test case, once you have written the first  | the first one, which decides what the thing is                |
| fixtures, seed data, fault scripts, the conformance harness      | the requirement the harness checks                            |
| "which assumptions in `REQUIREMENTS.md` does this sentence invalidate?" — search-shaped work | the decision about what to do with the answer |
| a migration script, from a design you wrote down                 | the schema design, and whether it is legal to keep the data   |
| translation packs, boilerplate, glue                             | the vocabulary — a new noun is a decision (`SOFTWARE-ENGINEERING-2.md`) |
| the retro questions                                              | the retro                                                     |

## Danger Will Robinson

- **A secret in a prompt.** The prompt goes to a third party. Reference by name, never paste a
  value (`1PASSWORD.md`).
- **Skipping the prompts.** The mode that bypasses permission checks exists, and its flag is named
  `--dangerously-skip-permissions` for a reason: it lets the agent write to `.git`, to `.claude`, and
  to anything else without asking. It is for sandboxes you can throw away, not for the repository
  with your term's work in it.
- **Letting it push.** A push is a publication (`GIT.md`'s elephant). It is yours to do, after
  reading.
- **Signing what you have not read.** The signature is the whole mechanism of ownership in this
  repository. An unread diff under a good signature is worse than an unsigned one, because it
  spends the trust.
- **A test that names the ID and asserts nothing.** `T-3` can be gamed by a machine faster than by a
  person. Watch it fail first.
- **The five-minute flag.** Asked for a feature that touches a scope decision, an agent will add a
  boolean column and a table and be done before you have opened the requirements. That is the
  pivot in `docs/TEAM-AND-CLIENT.md` at machine speed; the costing table comes before the prompt.

## When it goes wrong

| Symptom                                              | Cause                                          | Do                                                                |
| ---------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| it asserts something false about the code            | it did not open the file                       | "never assert something about this code you have not opened" — `AGENTS.md`; ask it to show the line |
| the diff touches ten files you did not name          | scope creep, or reformatting                   | reject; ask again with "only these files"                         |
| it added a dependency                                | fluency                                        | treat as a proposal; usually decline (`PACKAGES.md`)              |
| it "fixed" a failing test by weakening the assertion | Goodhart on green                              | restore the assertion; the test was right                         |
| it changed a requirement to match the code           | the costume rule (`CONTRIBUTING.md`)           | revert; if the requirement is wrong, that is a conversation with the client |
| the next session does not know what the last one decided | nothing was written down                   | the working set; `FINDINGS`; a line in `CLAUDE.md`                |
| it designed a schema before there was a requirement  | the waterfall, at machine speed                | stop; the railing (`AGILE_VS_WATERFALL.md`)                       |

## Checklist

- [ ] `claude` starts in the repository, in the default permission mode.
- [ ] `CLAUDE.md` exists, points at `AGENTS.md`, and says how to run and reset the system.
- [ ] `.claude/settings.json` allows the test and check commands and nothing that publishes.
- [ ] You have written a task as a done sentence with a requirement ID and received a diff you could
      read in one sitting.
- [ ] You ran the result yourself before committing it.
- [ ] The commit carries the `Co-Authored-By` trailer and your signature, and the pull request
      passed review.
- [ ] You asked the two retro questions and put the answers in the repository.

## In `parking/`

`AGENTS.md` is the working agreement and `CONTRIBUTING.md`'s *Working with agents* section is the
procedure: read the whole diff, credit the agent and keep the authority, ask for smaller drafts, push
back in the conversation and not in the commit. The essays give the reasons:
`SOFTWARE-ENGINEERING.md` on why an agent is a K3 factory and where to spend the time it saves, and
`AGILE_VS_WATERFALL.md` on why its arrival moves the human up the waterfall. And the repository's
own history is the demonstration: most of its documents were drafted with an agent, every one was
read and signed by a person, and the difference between those two facts is the subject of the whole
course.

## Resources

- Claude Code's documentation — *Getting started*, *Settings*, and *Permissions* are the three
  pages the setup above is built on; they move faster than this document, so trust them where they
  disagree.
- `AGENTS.md` and `CONTRIBUTING.md` in this repository.
- The *Working with agents* section of `SOFTWARE-ENGINEERING.md`, and *Ask your agents*, which is
  where the retro questions come from.
