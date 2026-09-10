# Essentials: Git

Git is the version-control tool Linus Torvalds wrote to manage large federated projects like the
Linux kernel. It is now used for far more than code: server configuration, documentation, and web
content are all problems that benefit from a history you can go back to. In this course it is also
the mechanism of ownership — a commit on `main` is signed by a person who has read it.

- **The fear it retires:** "I can't get back to when it worked." And, signed: "nobody vouched for
  this code."
- **The fence you prove:** `ssh -T git@github.com` greets you by name, and a commit you made shows
  **Verified** on GitHub.
- **Before this:** `SHELL.md`
- **After this:** `1PASSWORD.md` — you have just created two secrets that need a home

## The model

A repository is a graph of snapshots. Each node is a complete state of the project — source, tests,
build scripts, images — and each arrow points at what came before. A branch is a name for the
newest node on one line of work. Merging joins two lines.

```
             iss32:  o──o──o
                    /        \
  main:  o──o──o──o───o───o───o──▶   (each o is a commit; a name like `main` points at the newest)
```

Locally, git keeps three things you move changes between, and most confusion is not knowing which
one a command touches:

```
  working tree ──git add──▶ index (staged) ──git commit──▶ history (HEAD) ──git push──▶ remote (origin)
  the files you edit        the next commit's contents      what is recorded            GitHub's copy
                                                                           ◀──git pull──
```

**Danger Will Robinson.** Many tutorials show you how to make an isolated repository, and it is
often a checkbox in an IDE. This is a **bad** idea, because there is safety in numbers, and you will
be sad one day when your system does not boot and all your work is lost. A repository has a remote,
or it is not finished.

### Things to remember

- **Source goes in.** Code, tests, build scripts, images, sounds, and the documents that say what
  the code is for.
- **Build artifacts, secrets, and minutiae stay out.** Executables, libraries, `node_modules`,
  precompiled headers; API keys and passwords; the IDE's record of which windows are open.
- **Branches track issues, not people.** `db`, `ui`, `iss32` — not `alice` and `bob`. Bob might be
  sick and Alice has to step in. Git already records who made each change; the flow of work is
  about resolving issues.
- **Experiments are not on `main`.** `main` is a sequence of merges from branches of code that
  compiles and passes more and more tests.
- **Git is an elephant. It never forgets.** Once something is pushed, getting rid of it means
  rewriting history, force-pushing, and every collaborator re-cloning — and on a public repository,
  forks and caches mean you cannot be sure it is gone at all. So:
  - **Do not** `git add .` or use wildcard adds. You will add build artifacts that slow everyone
    down and create binary merge conflicts. Add files by name.
  - **Do not** add build artifacts. Large, useless to version control, and a conflict for everyone.
  - **Do not** add secrets. Use a password manager (`1PASSWORD.md`). If a secret does get pushed,
    **rotate it first** — revoke the key, issue a new one — before spending a minute scrubbing
    history, because the pushed value was compromised the moment it landed.
  - **Do not** add IDE minutiae. Removing them breaks the IDE; a conflict in them means you cannot
    use the IDE to fix it. A `.gitignore` says which files git should stop mentioning.

Most of this will not mean much until you have been bitten once. Read it again then.

## Once per machine

**Get git.** `SHELL.md` installed it: `xcode-select --install` on a Mac, `apt-get install git` on
Ubuntu and WSL. `git --version` confirms. Learn the command line even if you like GUI tools: you
will eventually decide it is faster, and every answer on the internet is a command, not a click.

**Sign up for GitHub.** Not with your campus email. GitHub should follow you into your career, so
use a permanent professional address you would be willing to show an employer. The free tier gives
unlimited public and private repositories with unlimited collaborators; the
[student developer pack](https://education.github.com/pack) adds paid tools while you are a
student, and expires when you stop being one, so do not build anything you depend on around it.

Turn on two-factor authentication now, not when it blocks you, and put the recovery codes in your
password manager (`1PASSWORD.md`). Every term somebody locks themselves out of the account holding
all their coursework, and there is very little anyone can do about it.

**D1. Tell git who you are.** Your real name, and an email that is verified on your GitHub account;
otherwise your commits will not link to your profile, which matters when someone looks you up to
decide whether to interview you. If you would rather not have your address in every public commit,
GitHub issues a private `noreply` address under Settings → Emails; use that here.

```sh
git config --global user.name  "Jane Doe"
git config --global user.email "jane@example.com"
```

**D2. Make a key pair.** Press Enter through the prompts. If it says the key already exists, answer
**n** — you do not want to overwrite the one you have.

```sh
ssh-keygen -t ed25519 -C "jane@example.com"
```

This creates `~/.ssh/id_ed25519` (private — never share, never commit) and
`~/.ssh/id_ed25519.pub` (public — the half you hand out).

**D3. Give GitHub the public half, twice.** Copy it to the clipboard:

```sh
cat ~/.ssh/id_ed25519.pub | pbcopy                 # mac
cat ~/.ssh/id_ed25519.pub | clip.exe               # windows (git-bash or WSL)
cat ~/.ssh/id_ed25519.pub | xclip -selection c     # linux (apt-get install xclip)
```

Then GitHub → your avatar → Settings → *SSH and GPG keys* → *New SSH key*. Add it **once as an
Authentication Key** (so you can push) and **once more as a Signing Key** (so your commits show as
Verified). Name each for the machine it lives on: "laptop", "lab-3".

**D3b. Check it.** Before cloning anything:

```sh
ssh -T git@github.com
```

The first time it asks you to confirm GitHub's fingerprint; type `yes`. Success looks like a
refusal: *Hi jane! You've successfully authenticated, but GitHub does not provide shell access.* If
you see `Permission denied (publickey)` instead, go back to D3; every later command will fail in a
more confusing way.

If it hangs forever, your network is blocking port 22 — some campus and corporate networks do.
GitHub takes SSH over 443; put this in `~/.ssh/config`:

```
Host github.com
  Hostname ssh.github.com
  Port 443
```

**D4. Sign your commits.** This repository requires it (`CONTRIBUTING.md`), and it is the same key.
Four lines, once per machine:

```sh
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

To *verify* signatures locally, git needs a list of trusted keys; this repository keeps one at
`.github/allowed_signers`, and `CONTRIBUTING.md` shows the per-repository line that points git at
it. Add yourself to that file in the format it shows. Then `git log --show-signature -1` after your
next commit should say *Good "git" signature*, and GitHub will show **Verified** beside it.

**D5. Pick where projects live.** `~/projects`, per `SHELL.md`.

## Once per repository

Two flavors. `<user>` is your GitHub username; `<repo>` is the repository name, in whatever
convention your professor requires.

**Clone, GitHub → local.** Easiest, and right whenever the files do not already exist on your
machine. Create the repository on GitHub (the `+` by your avatar), **non-empty**: include a README, a
LICENSE, and a `.gitignore` for your language. Then, from your projects directory:

```sh
cd ~/projects
git clone git@github.com:<user>/<repo>.git
```

**Push, local → GitHub.** When the project already exists on your machine. Create the repository on
GitHub **empty** — no README, no nothing. Then, inside the project directory:

```sh
git init .
git add <file1> <file2> ...        # by name; no wildcards
git commit -m "initial commit"
git branch -M main
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin main
```

**Use SSH, not HTTPS.** HTTPS with a token is not insecure; it is friction, and friction is what
kills the habit. The address from GitHub's *Code* button, SSH tab, looks like
`git@github.com:<user>/<repo>.git`.

**Two files in the first commit.**

- `.gitignore` — the patterns git should stop mentioning: `node_modules/`, build output, `.env`,
  the IDE's state. GitHub's language templates are a good start; this repository's is short and
  commented.
- `.gitattributes` with one line, `* text=auto`. Windows ends lines differently from Mac and Linux,
  and in a mixed team that shows up as a diff claiming you changed all four hundred lines of a file
  you barely touched. This line makes git normalize line endings in the repository and hand each
  person the flavor their system expects.

**Do not create a repository inside a repository.** IDEs notice they are in a git-managed directory;
if one offers to initialize a new one, say no.

## Every day

**See what changed.** `git status` lists files changed since the last commit; `git diff` shows the
changes; `git diff --staged` shows what the next commit will contain. If `status` keeps showing files
you do not want, that is what `.gitignore` is for.

**Add and commit.** Name the files. Commit with a message that says *why*, and, in this repository,
the requirement ID:

```sh
git add contract/signing.js contract/signing.test.js
git commit -m "S-8: refuse a field containing the separator"
```

This only affects the local repository. Almost always follow it with `git push`.

**Push early. Push often.** Your code takes up very little space and you will miss it if you lose
it. A pushed commit is a backup you can get back to; on your own branch it is not a decision you
have to defend.

**Give and take.** If you are not the only one pushing to a branch, sync the other way too:
`git pull`.

**Push rejected.** Sooner or later: `! [rejected] main -> main (fetch first)`. Nothing is broken. The
remote has commits you do not, because somebody else pushed or you pushed from another machine,
and git will not let you overwrite what you have not seen. Bring theirs down, then send yours up:
`git pull`, then `git push`. If git asks how to reconcile divergent branches, tell it once, globally,
to merge: `git config --global pull.rebase false`. **Never** fix a rejected push with
`git push --force`: it does exactly what it says and throws away commits you had not seen, which is
somebody else's afternoon.

### Branches

`main` is what GitHub creates now; older repositories say `master`. `git branch` tells you which you
are in. It is easy to forget which branch you are on and branch from the wrong one, so start from
`main`, fresh:

```sh
git switch main             # make sure you are on main   (older git: git checkout main)
git pull                    # get the latest from origin
git switch -c iss32         # create iss32 and switch to it (older git: git checkout -b iss32)
git push -u origin iss32    # publish it and remember the pairing; once per branch
```

`git branch -a` lists every branch, local and remote. Commit and push before switching branches. Git
will sometimes let you switch with uncommitted changes sitting there, but "sometimes" is not a rule
you can build a habit on, and half-switched work is how people lose an afternoon.

Deleting a branch is easy — `git branch -d iss32` locally, `git push origin --delete iss32`
remotely — and usually unnecessary; a dead branch costs nothing. Deleting a *commit* that has been
pushed is the elephant again.

### Merging

Merging does not end either branch. To bring `main` into your issue branch, which you should do
often so that your eventual pull request is clean:

```sh
git switch main && git pull        # get main current
git switch iss32                   # back to your work
git merge main                     # bring main in
git push
```

A good policy: merge `main` into the issue branch first; when the issue branch has all of `main`'s
changes and passes all the tests, *then* merge the issue branch into `main` — or, on a team, open a
pull request, which is the same merge proposed rather than performed (`GITHUB-ISSUES.md`).

### When a merge stops with a conflict

A conflict means two branches changed the same lines and git will not guess which you meant. It is
a normal part of merging, not a sign something went wrong: the merge pauses and waits. `git status`
lists the conflicted files under *Unmerged paths*, and those are the only files you touch.

Inside one, the disputed region is marked:

```
<<<<<<< HEAD
what your branch says
=======
what the branch you are merging says
>>>>>>> main
```

Make those lines read the way the file should finally read, and delete all three marker lines. In VS
Code the file shows the two versions as colored blocks with links above them — *Accept Current*,
*Accept Incoming*, *Accept Both*, *Compare Changes* — and the Source Control pane lists every
conflicted file so you can watch the list shrink. For anything more tangled than a line, *Compare
Changes* opens a three-way view that is much easier to think in than raw markers.

**Read the result before you move on.** Accepting one side is a decision about what the program
should do, and the buttons make it fast enough to click through without reading. A file with both
sides accepted often compiles fine and is still wrong.

When the file reads correctly: `git add` it to mark it resolved, repeat until nothing is unmerged,
`git commit` (git writes the message), `git push`. Two escape hatches: `git merge --abort` puts you
back exactly where you started, and `git checkout --merge <file>` restores the markers in one file
if you mangled your edits. The first is the important one: you are never trapped in a merge.

### Undo, by how far it went

| The change is…                          | Undo with                                   | Notes                                          |
| --------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| in the working tree, not staged         | `git restore <file>`                        | gone for good; it was never recorded           |
| staged, not committed                   | `git restore --staged <file>`               | unstages; the edit stays in the file           |
| committed, not pushed, wrong message    | `git commit --amend`                        | rewrites the last commit; fine before pushing  |
| committed, not pushed, wrong contents   | `git reset --soft HEAD~1`                   | uncommits, keeps the changes staged            |
| committed and pushed                    | `git revert <sha>`                          | a new commit that undoes it; history intact    |
| lost — "I had it a minute ago"          | `git reflog`                                | the elephant working for you: every `HEAD` git has seen |
| in the way — "I need a clean tree now"  | `git stash`, later `git stash pop`          | a shelf, not a branch; do not leave things on it |

The line between the rows is *pushed*. Above it, rewriting is fine. Below it, add a commit instead.

## Danger Will Robinson

- `git push --force` on a branch anyone else uses.
- `git add .` — see the elephant.
- A commit you cannot explain. In this repository your signature says *I have read this and I
  stand behind it*, and an agent's draft you did not read is exactly what the rule exists to catch.
- `git checkout` of a branch with uncommitted work you cared about.

## Checklist

- [ ] `ssh -T git@github.com` greets you by name.
- [ ] Two-factor is on, and the recovery codes are in your password manager.
- [ ] `git config --global -l` shows your name, a verified email, and `commit.gpgsign=true`.
- [ ] Your public key is on GitHub as both an authentication key and a signing key.
- [ ] A commit you made shows **Verified** on GitHub, and `git log --show-signature -1` agrees.
- [ ] The repository has `.gitignore` and `.gitattributes`, and has a remote.
- [ ] You have resolved one merge conflict on purpose and read the result.

## In `parking/`

`CONTRIBUTING.md` is the policy this document sets up: every commit on `main` is signed, the
signature is SSH, and `.github/allowed_signers` is the registry of humans — the same structure as
the device registry in `parking/DESIGN.md`, one layer up. Commit messages name the requirement ID
(`S-8`, `C-4`) so that `git log --grep S-8` walks from the history to the sentence that demanded the
change. And `.gitignore` there refuses `*.key` and `*.pem` while allowing `*.pub`, which is
requirement `I-7` enforced at the boundary git controls.

## Resources

- [Learn Git Branching](https://learngitbranching.js.org/) — the graph, interactively. An hour well
  spent before your first merge.
- [Pro Git](https://git-scm.com/book/en/v2) — the book, free. Chapters 2 and 3 are the daily
  commands; chapter 7 is what to read when you are ready to rewrite history on purpose.
- [Oh Shit, Git!?!](https://ohshitgit.com/) — the undo table above, in the voice you will be in
  when you need it.
- Udacity's *Version Control with Git* and *Shell Workshop* — free, short, and paced for beginners.
