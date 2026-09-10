# Essentials: GitHub Actions

Continuous integration is the idiot light with a URL. Every push is built and tested on a machine
that is not yours, and the result is one green or red mark on the pull request and one badge on the
README. It retires two fears at once — "it works on my machine" and "nobody ran the tests" — and it
is worth trusting only when it runs the same command you do.

- **The fear it retires:** "It works on my machine." "Nobody ran the tests before merging."
- **The fence you prove:** A green run on every push to your fork, running `npm run check` from
  `parking/`, with the badge in the README.
- **Before this:** `GITHUB-ISSUES.md`
- **After this:** `DOCKER.md`

## The model

```
  event (push, pull_request, schedule, manual)
    └─▶ workflow   (.github/workflows/check.yml)
          └─▶ job(s)   (each on a fresh runner: a virtual machine GitHub starts and throws away)
                └─▶ steps   (a shell command, or an action someone published)
                      └─▶ log, and an exit code   ──▶  ✓ or ✗ on the commit, the PR, and the badge
```

Three things to hold onto:

- **The runner is a stranger's machine.** Nothing on it is yours: no global installs, no `.env`,
  no `~/.ssh`. Whatever the job needs, a step has to put there. That is the feature — it is what
  makes "works on my machine" impossible to hide.
- **The exit code is the verdict.** A step that exits nonzero fails the job. `npm run check` is
  already shaped for this (`SHELL.md`).
- **The workflow file is code**, in the repository, reviewed like anything else. Changing it is a
  pull request.

## Once per repository

Create `.github/workflows/check.yml`. This is the workflow `CONTRIBUTING.md` describes for this
repository, with the parts that exist today:

```yaml
name: check

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:            # a "Run workflow" button, for when you want to run it by hand

permissions:
  contents: read                # least privilege: this workflow never writes to the repository

concurrency:
  group: check-${{ github.ref }}
  cancel-in-progress: true      # a second push makes the first run's answer irrelevant

jobs:
  tests:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    defaults:
      run:
        working-directory: parking
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v5      # use the current major; the log warns when one is retired
        with:
          node-version: 20
      - run: npm run check                # the same command you run: layering rule, then tests

  signatures:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0                  # the whole history, so the range below exists
      - run: git config gpg.ssh.allowedSignersFile .github/allowed_signers
      - run: |
          git log --format='%H %G?' origin/${{ github.base_ref }}..HEAD |
            awk '$2 != "G" { print "unsigned or untrusted: " $1; bad = 1 } END { exit bad }'

  integration:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    defaults:
      run:
        working-directory: parking
    steps:
      - uses: actions/checkout@v7
      - run: docker compose up --build -d
      - name: wait for the app                         # the power-on self test, from outside
        run: |
          for i in $(seq 1 30); do
            curl -fsS http://localhost:3000/api/lots > /dev/null && exit 0
            sleep 2
          done
          docker compose logs; exit 1
      - run: curl -fsS http://localhost:3000/api/lots | head -c 400
      - if: always()
        run: docker compose down -v
```

Two of the three jobs are exactly the checks `CONTRIBUTING.md` lists; the third stands in for
`parkctl conform --all --json` until `parkctl` exists. When it does, replace the `curl` line with the
conformance command and the job is done — the exit code is already the interface.

**The badge.** In `README.md`:

```
[![check](https://github.com/<user>/<repo>/actions/workflows/check.yml/badge.svg)](https://github.com/<user>/<repo>/actions/workflows/check.yml)
```

**Required checks.** In the branch protection rule (`GITHUB-ISSUES.md`), add `tests` and
`signatures` as required. Now a pull request cannot merge red.

## Every day

- **Push, then look.** The *Actions* tab, or the ✓/✗ beside the commit. Red means read the log,
  starting at the first red step, not the last.
- **Reproduce locally with the same command.** If CI ran `npm run check`, run `npm run check`. If
  it passes locally and fails in CI, the difference is the environment, and `DOCKER.md` and
  `PACKAGES.md` are about exactly that difference.
- **Keep the workflow the same as your script.** If the build step is `./build.sh` in both places
  there is no second recipe to drift. A workflow full of steps that nobody runs locally is a
  workflow nobody can debug.

### Platforms

Building for a platform and running on it are different tests. A matrix runs the same job on
several runners, and `fail-fast: false` keeps the others going when one breaks, because the
interesting question is always *which* platforms broke:

```yaml
  tests:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, ubuntu-24.04-arm, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
```

`ubuntu-24.04-arm` is a real `arm64` machine, which is how the container nuance in `DOCKER.md` gets
tested rather than assumed.

### Secrets in a workflow

*Settings → Secrets and variables → Actions.* A secret is exposed to a step only as
`${{ secrets.NAME }}`, is masked in the log, and is **not** available to pull requests from forks.
Never `echo` one. Prefer not to need one: the tests in this repository need no secret at all, and
that is a design property worth keeping.

## Danger Will Robinson

- **`pull_request_target` with a checkout of the pull request's code.** That event runs with the
  base repository's secrets; checking out and executing a stranger's branch under it hands them
  your secrets. Use `pull_request` unless you know exactly why not.
- **Untrusted text inside `${{ }}` in a `run:` step.** `run: echo "${{ github.event.issue.title }}"`
  is a shell injection; a title containing `$(curl …)` runs it. Pass such values through `env:`
  and quote the variable: `env: TITLE: ${{ … }}` then `run: echo "$TITLE"`.
- **`permissions: write-all`**, or no `permissions:` block at all, which can default to more than
  you meant.
- **An unpinned action.** `uses: someone/action@main` runs whatever is on `main` today, as you.
  Pin a major at least; pin a commit SHA if the action is not from GitHub itself.
- **A path-filtered workflow made a required check.** If it never starts for a commit outside its
  paths, the pull request reads *pending* forever.

## When it goes wrong

| Symptom                                       | Cause                                                  | Do                                                            |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| green locally, red in CI                      | the environment differs: Node version, a global, `.env` | pin the version in `setup-node`; remove the global; the runner has no `.env` — good |
| red locally, green in CI                      | CI is not running what you think                        | read the workflow: is the working directory right? is the step actually running the tests? |
| red on Wednesday with no commit since Tuesday | something floated: a dependency, `ubuntu-latest`, an action major | `PACKAGES.md`: the lock file; pin the runner image; read the log's first red line |
| the badge says "no status"                    | the workflow file name in the URL is wrong, or the workflow has never run on `main` | check the file name; push to `main` once |
| "resource not accessible by integration"      | `permissions` too narrow for a step                     | grant only the one permission that step needs                 |
| the run is pending forever                    | a required check whose workflow did not start           | the path-filter trap above                                    |

## Checklist

- [ ] `.github/workflows/check.yml` exists, runs `npm run check`, and is green on `main`.
- [ ] The workflow runs the same command you run by hand.
- [ ] `permissions:` is present and minimal; every job has `timeout-minutes`; actions are pinned.
- [ ] The badge is in the README and reflects `main`.
- [ ] `tests` and `signatures` are required checks on `main`.
- [ ] You have read one red log to its first red line and fixed the cause, not the symptom.

## In `parking/`

`CONTRIBUTING.md` names three checks — signatures, conformance, integration — and says *anything
that is merely a convention is not a policy*. At this writing no workflow file exists in the
repository, so the checks are a convention. The file above is what turns them into a policy; adding
it is a pull request, and the first time it goes red on a real change is the first time the badge
means something.

## Resources

- GitHub's *Workflow syntax for GitHub Actions* — the reference for every key used above.
- GitHub's *Security hardening for GitHub Actions* — the source of the Danger list, at length.
- The languages course repository's workflows — a six-platform matrix and a container build, both
  small enough to read in one sitting.
