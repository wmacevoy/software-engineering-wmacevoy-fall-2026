# Essentials: GitHub Issues and Pull Requests

Git records *what* changed. This is the layer that records *why*, *who is on it*, and *whether
anyone else looked*. An issue is a unit of work; a branch is named for it; a pull request proposes
the merge; a review approves it; the merge closes the issue. One loop, and every step leaves a
record someone can find in a month.

- **The fear it retires:** "Nobody knows what is being worked on, or why this change exists, or
  whether anyone read it."
- **The fence you prove:** An issue closed automatically by a merged pull request that names it,
  with a review approval and a green check on it.
- **Before this:** `1PASSWORD.md`
- **After this:** `GITHUB-ACTIONS.md` — the green check is what that one supplies

## The model

```
  issue #32 ──▶ branch iss32 ──▶ commits ──▶ pull request ──▶ review + checks ──▶ merge ──▶ closed
  the why       the where        the what     the proposal     the evidence        the record
```

**Branches track issues, not people** (`GIT.md`). The issue number is the thread that ties the
branch, the commits, the pull request, and the conversation together, and `Closes #32` in the pull
request is what closes the loop by machine rather than by memory.

Three more objects, and what each is for:

| Object        | What it is                                        | Here                                              |
| ------------- | ------------------------------------------------- | ------------------------------------------------- |
| Label         | a tag on an issue: `bug`, `requirement`, `S`, `C` | the requirement section, so `S` issues can be listed |
| Milestone     | a named date that issues belong to                 | the iteration (`docs/TEAM-AND-CLIENT.md`)         |
| Project board | columns of issues: to do, doing, done              | `QUEUE`, held by the Queue role                   |

## Once per repository

1. **Protect `main`.** *Settings → Branches → Add rule* for `main`: require a pull request before
   merging, require status checks to pass, require signed commits, and do not allow force pushes.
   After this a direct push to `main` is refused no matter how correct the merge was, which is the
   point.
2. **Decide the merge method**, once, in *Settings → General → Pull Requests*. Merge commits keep
   every commit and add one; squash collapses the branch into one commit; rebase replays them.
   Pick one so the history reads one way. Whatever you pick: **merging in the web UI produces a
   commit signed by GitHub's key, not yours.** This repository's signature check
   (`CONTRIBUTING.md`) trusts only keys in `.github/allowed_signers`, so the merge that lands on
   `main` is done locally, with your key, and pushed — the pull request still carries the review.
3. **Add templates.** `.github/PULL_REQUEST_TEMPLATE.md` with the four headings from
   `CONTRIBUTING.md`: what changed, which requirement IDs, how you verified it, what you
   deliberately left out. `.github/ISSUE_TEMPLATE/` with two forms: a bug (steps to reproduce,
   expected, actual) and a requirement (the observable sentence, the ID, the done criterion).
4. **Create the labels** you will actually filter by. Fewer is better; a label nobody filters by is
   noise.

## Every day

### Writing an issue

An issue is a *what* and a *why*, in a form that can be closed:

- **Title as a verb phrase.** "Mark a lot stale when `age_ms` exceeds the threshold," not
  "staleness."
- **The pain, then the observable done criterion.** What happens today, what must be true when it
  is fixed, which requirement ID. "Done when `T-2`'s stuck-sensor test passes and the driver view
  shows the age."
- **Not a design.** "Add a `stale` column" is a design; the issue says what must be observable, and
  the pull request says how (`AGILE_VS_WATERFALL.md`, section on requirement versus design).
- **A bug report is a reproduction.** Exact steps, exact values, exact output. A bug you cannot
  reproduce is a rumor, and `T-1` — deterministic sequences, exact asserted values — is what makes
  a reproduction possible to write.
- **Assign it** when someone starts, not before. An issue with an assignee and no branch for a
  week is the stand-up's "blocked — since when."

### Opening a pull request

```sh
git switch main && git pull
git switch -c iss32
# ... work, commit by name, push early ...
git push -u origin iss32
```

GitHub offers a *Compare & pull request* button right after the push. Fill the template. Put
`Closes #32` in the description. Mark it a **draft** if it is not ready for review; a draft says
"look if you like, do not approve yet."

Keep it to **one concern.** Reviewer attention is the scarce resource, and a bundled diff spends it
on separating things that should never have been joined. If the change touches two requirements,
that is two pull requests. Merge `main` into your branch first (`GIT.md`) so the diff shows only
your change.

### Reviewing

The reviewer asks three questions, in order (`CONTRIBUTING.md`):

1. Does it do what the requirement says, and does the test prove it?
2. Could a student read this in a month and explain why it is here?
3. What does it make harder later?

Comment on lines, not in general. *Approve*, *Request changes*, or *Comment* — and say which
question the comment is about. As the author, respond to every comment, even with "done," so the
reviewer can see the thread close. Push more commits to the same branch; the pull request updates.

**Read the whole diff.** The one line you skipped is the one that was generated, or pasted, or
merged wrong. If you cannot explain a line, it does not go in; that rule applies to reviewers as
much as authors.

### Merging

When the checks are green and the review is approved:

```sh
git switch iss32 && git pull
git switch main && git pull           # main may have moved
git merge iss32                       # signed with your key
git push                              # the PR shows Merged; #32 closes
```

Then leave the branch alone or delete it; it costs nothing either way.

## Danger Will Robinson

- **`git push --force` to a branch with an open pull request.** It rewrites what the reviewer
  already read.
- **A pull request nobody can review in one sitting.** Three hundred lines from an agent is not a
  pull request; it is a request that someone else take ownership of something you did not read.
- **Issues used as chat.** Decisions go in the description or in the documents; a forty-comment
  thread is where decisions go to be lost.
- **Closing an issue by hand** when the pull request should have. If it did not close, the
  description did not say `Closes #32`, and the link between the change and its reason is gone.

## When it goes wrong

| Symptom                                        | Cause                                        | Do                                                              |
| ---------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------- |
| "This branch has conflicts that must be resolved" | `main` moved under you                    | `git merge main` into your branch, resolve, push (`GIT.md`)     |
| the check is red                               | the tests fail on a machine that is not yours | read the log from the first red step; reproduce with the same command (`GITHUB-ACTIONS.md`) |
| you committed to `main` by accident            | forgot to branch                             | before pushing: `git switch -c iss32` takes the commits with you; then `git switch main && git reset --hard origin/main` |
| the merge was refused: "required status check" or "unsigned" | protection is doing its job    | fix the cause; do not ask an admin to bypass it                 |
| two people did the same task                   | no assignee, or no board                     | the Queue role's cursor exists to prevent this; use it          |

## Checklist

- [ ] `main` is protected: pull request required, checks required, signed commits required, no
      force pushes.
- [ ] The merge method is decided and written down.
- [ ] Pull request and issue templates exist and match `CONTRIBUTING.md`.
- [ ] Every branch is named for an issue.
- [ ] Every pull request says what changed, which IDs, how verified, and what was left out.
- [ ] You have opened, reviewed, and merged one pull request that closed its issue by itself.

## In `parking/`

The seven unbuilt components are seven issues waiting to be opened, each with its README as the
description and its requirement IDs as the done criterion. The `Migration` note in
`REQUIREMENTS.md` — retire the push endpoint and the `sensor` role when the collector lands — is an
issue with a stated trigger. And `CONTRIBUTING.md`'s pull-request section is the template above,
already written: one concern, four headings, three reviewer questions.

## Resources

- GitHub's own documentation on *branch protection rules*, *linking a pull request to an issue*,
  and *issue and pull request templates* — short, and they move the buttons, so prefer these to
  screenshots.
- `gh` — GitHub's command-line tool. `gh pr create`, `gh pr checks`, `gh issue list` do everything
  above without leaving the terminal, and `gh pr checkout 32` fetches a teammate's branch for
  review in one line.
