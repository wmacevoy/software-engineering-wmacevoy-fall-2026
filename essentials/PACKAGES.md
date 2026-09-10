# Essentials: Packages

Every project stands on code you did not write, and that code changes under you. A package
manager is how you say what you are compatible with, record what you actually installed, and take
a fix when one arrives — three different jobs, and the mistakes come from giving all three to one
file.

- **The fear it retires:** "A different install broke it." And: "That CVE has been open for a year."
- **The fence you prove:** A lock file committed, an install that refuses when the lock and the
  manifest disagree, and one dependency update taken as a pull request with green tests.
- **Before this:** `DOCKER.md`
- **After this:** `AGENT.md`

## The model

```
  manifest  ──resolver──▶  lock  ──install──▶  node_modules/ (or .pixi/, or target/)
  what you are              what you ran:       what is on this machine right now
  compatible with:          exact versions,
  ranges, by major.minor    with hashes,
                            per platform
  committed                 committed           ignored
```

Semantic versioning is the interface between you and strangers: `major.minor.revision`, where the
major changes when something breaks, the minor when something is added, and the revision when
something is fixed. So the policy, from `TESTING.md`:

> In the manifest, say what you are compatible with — the major, and the minor you need as a floor.
> In the lock, record what you ran — the revision, and the hash. Commit both.

| Policy in the manifest                          | Repeatable?        | When a CVE lands                                        | In practice                    |
| ----------------------------------------------- | ------------------ | ------------------------------------------------------- | ------------------------------ |
| nothing pinned: `*`, `latest`                   | no                 | you already have the fix, and every breaking change     | red on Wednesday, no commit    |
| the revision pinned: `4.19.2`                   | yes, by hand       | someone edits every pin, everywhere, after reading every changelog | never                |
| **major.minor in the manifest, revision in the lock** | yes, by the lock | `npm update`, run the suite, commit the lock: an hour | a reviewable, revertible diff  |

Repeatability against survivability. The middle row survives; the last row is the one that is
both.

## Once per machine

**Node.** Install a version manager rather than a bare Node, so the version is per project:
`fnm` or `nvm`. Then `fnm install 20` (or `nvm install 20`). `node --version` should print a
`20.x`. The major is the pin; the revision floats.

**pixi** (or conda) for anything Python, R, or with a compiled dependency that varies by hardware:
one installer from `pixi.sh`, then `pixi --version`. **cargo** comes with Rust via `rustup`. You
will not need all three today; you will need the habit that is the same in all three.

## Once per repository

### npm

`package.json` is the manifest. Ranges:

| Written        | Means                    | Use                                                       |
| -------------- | ------------------------ | --------------------------------------------------------- |
| `^4.19.2`      | `>=4.19.2 <5.0.0`        | the default, and the policy: within the major             |
| `~4.19.2`      | `>=4.19.2 <4.20.0`       | within the minor; rarely needed                           |
| `4.19.2`       | exactly this             | almost never; that is the lock file's job                 |
| `*`, `latest`  | anything                 | never                                                     |

`package-lock.json` is the lock. It is generated, it is committed, and it is never edited by hand.
Two commands, and the difference between them is the whole point:

| Command       | Does                                                                                  |
| ------------- | ------------------------------------------------------------------------------------- |
| `npm install` | resolves from the manifest, **updates the lock**, installs. For adding or changing a dependency. |
| `npm ci`      | installs **exactly** the lock, and **refuses** if the lock and manifest disagree. For everyone else, every time, and in every Dockerfile and workflow. |

Pin the runtime too: an `engines` field in `package.json` (`"node": ">=20 <21"`) and a `.nvmrc` or
`.node-version` file containing `20`, so a teammate's version manager picks the same major.

**In `parking/app/`, at this writing, the lock file does not exist**, and `app/Dockerfile` runs
`npm install` from the manifest alone. Every image build resolves `express`, `jsonwebtoken`, and
`pg` fresh, and nothing records what it chose. The fix is three lines:

```sh
cd parking/app
npm install --package-lock-only        # write package-lock.json without touching node_modules
git add package-lock.json
```

then in `app/Dockerfile`, copy the lock beside the manifest and install with `npm ci`:

```dockerfile
COPY app/package.json app/package-lock.json ./
RUN npm ci --omit=dev
```

`parking/package.json`, the workspace root, has **no dependencies at all**, on purpose: the tests
use Node's built-in runner, so nothing has to be installed to run them. That is not minimalism; it
is one fewer thing to learn, trust, audit, and update, forever.

### pixi

`pixi.toml` is the manifest; `pixi.lock` is the lock, with **one resolution per platform**. The
same policy, in its syntax:

```toml
[workspace]
platforms = ["osx-arm64", "linux-64", "win-64"]     # everything the lock will hold an answer for

[dependencies]
python = ">=3.12,<3.14"                             # major.minor floor, major ceiling
numpy  = ">=2,<3"
```

| Command                 | Does                                                            |
| ----------------------- | --------------------------------------------------------------- |
| `pixi add numpy`        | edits the manifest and re-locks                                 |
| `pixi install --locked` | installs exactly the lock, refuses if it is stale — the `npm ci` |
| `pixi update`           | re-resolves within the ranges and rewrites the lock — the update |
| `pixi run test`         | runs a task from the manifest, in the environment                |

Reach for pixi instead of a container when a dependency differs by hardware, the toolchain is too
big for an image, the tool has a real window, or it needs a device the container cannot see. The
languages course repository's `ml/` directory is the worked example and says when *not* to.

### cargo

`Cargo.toml` and `Cargo.lock`; `cargo build --locked` is the `npm ci`. Same shape.

## Every day

- **Add a dependency as a proposal, not a decision.** `AGENTS.md`: each one is something a student
  must learn, trust, and audit. Prefer what is already there and the standard library. Look at the
  package's install scripts, its dependency count, and when it was last released before adding it.
- **Take updates on a schedule.** Weekly, by a named person or a bot. `.github/dependabot.yml`
  opens the pull request for you:

  ```yaml
  version: 2
  updates:
    - package-ecosystem: npm
      directory: /parking/app
      schedule:
        interval: weekly
  ```

  The suite runs on the pull request (`GITHUB-ACTIONS.md`); if it is green, merge it that day. That
  is the hour. A lock file that is never regenerated is a revision pin with extra steps.
- **`npm outdated`** shows what the ranges would allow; **`npm audit`** lists known vulnerabilities
  in the lock. Read the second one for severity and reachability, not for its count.
- **Never edit the lock by hand.** If a merge conflicts in it, take either side and regenerate:
  `npm install` (or `pixi lock`), then commit.

## Danger Will Robinson

- **`npm install` in CI or in a Dockerfile.** It may rewrite the lock or ignore it. `npm ci`.
- **A lock file not committed.** Then there is no record of what you ran, and the container is
  repeatable only at the level of the operating system (`DOCKER.md`).
- **`rm -rf node_modules && npm install` as a fix.** It works because the lock drifted or the
  manifest changed; find out which, or it will happen to the next person.
- **A dependency added by an agent.** It is fluent about packages you have never heard of. Treat
  the addition as the proposal it is (`AGENT.md`).
- **Typosquats and install scripts.** A package one letter off from the one you meant, with a
  `postinstall` that runs on your machine. Read the name twice; check the weekly downloads.

## When it goes wrong

| Symptom                                           | Cause                                                | Do                                                            |
| ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------- |
| `npm ci` fails: "lock file out of sync"           | someone changed the manifest without re-locking      | `npm install`, commit the lock, then `npm ci` again           |
| works after deleting `node_modules`               | lock drift, or a stale install                        | use `npm ci`; find what changed                               |
| `ERESOLVE` peer dependency conflict               | two packages want incompatible majors of a third      | read which; pick versions that agree; do not `--force`        |
| a native module fails on `arm64`                  | no prebuilt binary for the platform                   | `DOCKER.md`'s three choices; or a pure-JavaScript alternative |
| green Tuesday, red Wednesday, no commit           | something floated — a floating range with no lock, or `latest` | pin the major; commit the lock                       |
| `npm audit` shows a hundred findings              | most are in dev tools and unreachable                  | fix the ones in runtime dependencies first; do not `audit fix --force` |

## Checklist

- [ ] The manifest uses `^major.minor` ranges and no exact revisions.
- [ ] The lock file exists and is committed; the install in CI and in the Dockerfile is `npm ci`.
- [ ] The runtime major is pinned in `engines` and in a version file.
- [ ] Updates are scheduled — a bot or a named person — and the suite runs on each.
- [ ] You have merged one dependency update as a pull request, green, and could revert it in one
      commit.
- [ ] You can explain to a classmate why a pinned revision is the "never" row.

## In `parking/`

Two manifests, two deliberate states. `parking/package.json` has zero dependencies so that the
tests run with nothing installed. `parking/app/package.json` has three, with `^` ranges — the right
policy — and no lock, which is the open finding `TESTING.md` names and this document fixes. The
image's base tag, `node:20-alpine`, is the same policy applied to the runtime: major pinned,
revision floats, `docker compose pull` is the update.

## Resources

- semver.org — the eleven rules, and why a revision may float.
- npm's documentation on `package-lock.json` and `npm ci` — short, and the distinction is the
  whole subject.
- pixi's documentation on the lock file and multi-platform solves; the languages course
  repository's `ml/README.md` as the worked example.
