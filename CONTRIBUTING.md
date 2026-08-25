# Contributing

How work gets from written to accepted in this repository.

`AGENTS.md` says humans own the structure and agents author and advise. This document is where that
stops being a statement and becomes a procedure.

## Signing your work

**Every commit on `main` is signed.** Not as ceremony — it is the mechanical form of ownership. An
agent can write a diff; only a person can sign it, and signing is the act of saying *I have read
this and I stand behind it*.

Use SSH signing. You already have an SSH key for GitHub, and GPG key management is where this
practice usually dies in a classroom.

```sh
git config --local gpg.format ssh
git config --local user.signingkey ~/.ssh/id_ed25519.pub
git config --local commit.gpgsign true
git config --local gpg.ssh.allowedSignersFile .github/allowed_signers
```

Add yourself to `.github/allowed_signers`, one line per person:

```
you@example.edu namespaces="git" ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...
```

Check your own work before pushing:

```sh
git log --show-signature -1
```

That file is a **registry of humans**: a mapping from identity to public key, with enrollment and
revocation. It is the same structure as the device registry in `parking/DESIGN.md`, one layer up.
Recognizing the pattern in two places is the point.

## Working with agents

Agents draft. People sign. Concretely:

- **Read the whole diff before you commit it.** If you cannot explain a line to someone else, it
  does not go in. Working code you cannot defend is a liability here, not an asset — the goal of
  this repository is fluency, and an unexplained dependency on a generated answer is the opposite.
- **Credit the agent, keep the authority.** Add a trailer; the signature stays yours.

  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

- **Ask for smaller drafts.** An agent will happily produce three hundred lines. A diff you cannot
  review is a diff you cannot sign.
- **Push back in the conversation, not in the commit.** If the design is wrong, argue it before it
  becomes history.

## Definition of done

A change is done when all of these are true. Not most.

- [ ] It satisfies a stated requirement, and the commit message names the ID (`C-4`, `L-9`, …).
- [ ] A test references that same ID and fails without the change.
- [ ] `docker compose up --build` works from a clean checkout.
- [ ] The full check suite passes locally.
- [ ] Anything now untrue in `REQUIREMENTS.md`, `DESIGN.md`, or `CLAUDE.md` is updated in the same
      commit. Documentation that drifts is worse than none, because people trust it.
- [ ] New behavior that can fail has a fault mode or an attack demonstration, per `F-5` and `F-6`.
- [ ] The commit is signed.

## Requirements, design, and this file

Three documents, three questions, and changes belong in exactly one of them:

| Document                  | Answers                          | Changes when            |
| ------------------------- | -------------------------------- | ----------------------- |
| `parking/REQUIREMENTS.md` | what must be observably true     | the goal changes        |
| `parking/DESIGN.md`       | how we intend to achieve it      | the mechanism changes   |
| `CONTRIBUTING.md`         | how work is accepted             | the process changes     |

If a pull request edits a requirement to match what the code happens to do, that is a design change
wearing a costume. Say which one you mean.

## Pull requests

**One concern per pull request.** Reviewer attention is the scarce resource in this repository, and
a bundled diff spends it on separating things that should never have been joined.

Include: what changed, which requirement IDs, how you verified it, and what you deliberately left
out. The last one matters most — silent omissions are the expensive kind.

Reviewers are asking three questions, in order:

1. Does it do what the requirement says, and does the test prove it?
2. Could a student read this in a month and explain why it is here?
3. What does it make harder later?

## What continuous integration enforces

Anything that is merely a convention is not a policy. These run on every push:

```sh
# 1. every commit in the range is signed by a known key
git log --format='%H %G?' "$BASE..HEAD" |
  awk '$2 != "G" { print "unsigned or untrusted: " $1; bad = 1 } END { exit bad }'

# 2. conformance — the same CLI ops uses, exit code is the verdict
parkctl conform --all --json

# 3. integration — faults driven through the control plane, not waited for
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

The conformance checker is one program doing three jobs: the ops tool, the CI gate, and the
grading harness. That is why it takes `--json` and returns a meaningful exit code, and why it never
prompts.

## Local loop

```sh
cd parking
docker compose up --build      # full system
docker compose down -v         # reset; required after any schema change
parkctl conform --all          # what CI will run
```

`CLAUDE.md` covers what the code does and where things live. Read `AGENTS.md` before pointing
an agent at any of it.
