# Testing

A guidebook. Generalized from the ArduinoUnit guidebook — *The Zen of Testing* — which was written
for embedded systems and one framework, to software in any setting, and framed the way this
repository frames every practice: by the fear it retires.

| Document                  | Answers                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `SOFTWARE-ENGINEERING.md` | why the cost of a test changes everything                            |
| `TESTING.md`              | how to make tests worth trusting, and environments that stay the same |
| `docs/TEAM-AND-CLIENT.md` | who is building it, and who it is for                                |
| `CONTRIBUTING.md`         | what continuous integration enforces                                 |
| `parking/REQUIREMENTS.md` | `T-1`–`T-5`, the testing requirements of the example                 |

The embedded world has to be honest about testing because it cannot be otherwise. The device is
dark, memory is counted in bytes, a debugger may not attach, and the hall-effect sensor is as much a
part of the system as the loop that reads it. Everything the ArduinoUnit guidebook says under those
constraints stays true when the constraints are lifted. What changes is that it becomes *possible to
forget*, and the forgotten parts are exactly where the fear comes back.

Most of this document is not checkable by continuous integration. The parts that are, are named.

## Terms used here

| Term            | Meaning                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ |
| **K0–K4**       | The five kinds of not-knowing, from `SOFTWARE-ENGINEERING.md`: known, known unknown, unknown unknown, confidently wrong, and a falsehood kept on purpose. |
| **Repeatable**  | The same test, run again — alone or beside any other, in any order, on any machine — gives the same verdict. |
| **State**       | Anything a test reads or writes that outlives it: a row, a file, an environment variable, the clock, a port, a singleton. |
| **Fence**       | A checkpoint that proves something. A green run that could not have been red is not one.        |
| **Manifest, lock** | The file that says what you are compatible with, and the file that says what you actually ran. |

---

## 1. A test is a fear with a name

The ArduinoUnit guidebook opens with a hot dog cart: a cart that only rolls forward and left, a
heater that takes thirty minutes to start, a chiller that leaks, a money box that opens four times in
five. You will be out of business soon. Then the arithmetic. N independent parts at reliability P
work together with probability P^N. Ten parts at 90% is 35% — not a bridge anyone wants to use. For
ten parts to give 99%, each must be 99.9%.

> Solving bigger problems reliably requires more reliable components.

> A reliable thing works when in good repair and used correctly, and has detectable error status
> when it is broken or misused.

That second sentence is the whole subject, and it has two halves: it works, and *it says so when it
does not*. Most testing effort goes to the first half. Most production pain comes from the second.

`SOFTWARE-ENGINEERING.md` says every practice retires a fear, and names tests as retiring "I don't
know if I just broke something." That is true of a suite as a whole and too coarse to act on.
Testing is a family, and each member retires a different fear. The guidebook's list of what to test
is, read this way, a list of fears:

| Test what      | The question                                   | The fear it retires                                             | In `parking/`                                          |
| -------------- | ---------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------ |
| Configuration  | Is a startup requirement missing?              | "it will fail at 3am for something we could have checked at boot" | `db.js` exits without `DATABASE_URL`                  |
| Status         | Is a component broken right now?               | "it is broken and nobody can tell"                              | `/health` (`S-5`); `live`, `stale`, `unreachable` (`C-4`) |
| Input          | Is the input absent, late, wrong, or lying?    | "garbage got in"                                                | `C-1`, `C-5`, `C-7`; the whole `F` switchboard         |
| Output         | Is the result in bounds and in the right shape? | "we said something impossible"                                 | `S-7`; one error envelope (`V-5`)                      |
| State          | Is what we hold still sane?                    | "we drifted into nonsense and kept answering"                   | `N-5`; `CHECK (occupancy <= capacity)`                 |
| Time           | Is it taking too long?                         | "it will not keep up"                                           | `C-2`: the timeout is shorter than the poll            |
| Space          | Is it taking too much room?                    | "it will fill up"                                               | `E-4`, `E-8`; `L-12` samples the steady state          |

Two rules from the essay apply with full force:

- **A test that reduces no one's anxiety will be dropped under pressure**, and should be. If you
  cannot say which row a test belongs to, find the row or delete the test.
- **A test that reduces anxiety without reducing risk is worse than none.** A test that cannot fail.
  A mock that agrees with everything. A suite that is green because it was skipped. Watch every test
  fail once — `CONTRIBUTING.md` requires it — because a green you have never seen red is a K3 with a
  checkmark on it.

### The question you can ask

> "Which fear does this test retire, and have I ever seen it fail?"

---

## 2. Six steps to a reliable thing, without the Arduino

The guidebook's method is a ladder of six steps, each stated for a microcontroller with a serial
port. Each generalizes, and the generalization is usually something a larger system has forgotten to
do — because it *could* forget, having gigabytes to be careless in.

| Step                     | On a microcontroller                                  | In general                                                                                     | In `parking/`                                            |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| The idiot light          | pin 13 blinks if any test has failed                  | one pass/fail visible from across the room: an exit code, a badge, a health endpoint, a tile  | `parkctl conform` exits nonzero; `/health`; `npm run check` |
| The power-on self test   | refuse to run if the flash or the LCD is bad          | refuse to start if a precondition is missing — loud, early, before serving anyone              | `db.js` exits without `DATABASE_URL`                     |
| Sanity, repeated         | a `testing()` block reruns; soft-reset when it fails  | invariants checked continuously in production, and a safe state to fall back to               | `N-5`; the `CHECK` constraints; `E-7` serves stale, with its age |
| IO                       | `MockStream` stands in for the serial port            | a stand-in for every input, that misbehaves on request                                         | the sensor's fault switchboard (`F`)                     |
| Time                     | a budget in microseconds, monotonic against rollover  | a budget with an assertion, measured by a clock that only moves forward                        | `C-2`; `age_ms` from a monotonic source (`S-3`, `N-3`)   |
| Space                    | free bytes above a floor; check every `malloc`        | rows, logs, memory, disk, sized from the numbers — and every acquisition checked               | `E-4`, `E-8`, `L-12`; pool exhaustion; a full volume     |

Three of these deserve more than a row.

**The power-on self test.** *If your thing can't run without certain things, make sure those things
are ok or just stop.* The larger-system failure is the opposite: start anyway, log a warning, and
serve wrong answers until someone reads the log. `parking/` has one of each. `db.js` exits when
`DATABASE_URL` is missing — a self test. `index.js` warns when `JWT_SECRET` is missing and continues
with `dev-secret` — a self test that lets you drive off with the hood open. The second is a chosen
falsehood for a demo, and it is the exact shape of every "temporary" default that reaches
production. The rule: **a missing precondition is an exit code, not a warning**, unless someone has
written down why not.

**Sanity, repeated, with a safe state.** The guidebook reruns a sanity test every 250 milliseconds
and soft-resets the board when it fails, on the theory that a reboot might help. The general form is
invariants that are checked *while the system runs* — not only in the suite — and a stated, tested
move to a safe state when one is violated. Restart the container. Fail over. Serve the last good
count with its age attached (`E-7`, `U-1`). The reboot is not the embarrassing part. The embarrassing
part is a system that has noticed it is insane and keeps answering.

**IO, and the chicken and the egg.** You cannot test input handling without controlling the input,
and the code that reads the real input is exactly the code you want to test. ArduinoUnit's answer is
`MockStream` plus a design rule — *serve, don't rule* — which section 7 is about. `parking/` gives
the same answer at system scale: the sensor is a real service that can be told to be `slow`, `down`,
`stuck`, `wrong`, `flapping`, or `skewed` (`F`), and the mock and the real thing answer to one
conformance check (`T-4`), so swapping them is an event with a result rather than a discovery.

---

## 3. Repeatability is a property of state

A repeatable test gives the same verdict every run — alone, beside any other test, in any order, on
any machine. The essay says why this matters: a flaky test trains a team to ignore red, and after
that the suite that would have caught the real failure has been disarmed.

Repeatability is not a property of the test. It is a property of **the state the test touches**,
and that state has exactly three scopes:

| Scope       | What it means                                                  | Repeatable?                                                                   | Examples                                                                                                   |
| ----------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Local**   | the test creates it and destroys it                            | yes, and safe to run in parallel                                              | a `MockStream` declared inside the test; a pure function's arguments; a temporary directory; a fresh object |
| **Sharded** | shared infrastructure, partitioned so each test or worker owns a slice | yes — if the key is unique and the test stays inside its slice        | one database schema per worker; one lot id per test; one sensor container per job; a trace id              |
| **Global**  | one instance, read and written by everyone                     | no. **A test that modifies global state is a race condition, not a test.**   | a shared development database; a seeded row two tests update; environment variables; the system clock; a singleton; a fixed port |

The third row is the one to memorize. A test that writes global state passes when run alone, then
fails when another test runs first, or at the same time, or against the rows yesterday's run left
behind. The failure is order-dependent, nondeterministic, and reproduces most reliably on the machine
of the person least able to fix it. Everything you have ever heard about flaky tests is this row.

The fixes, in order of preference:

1. **Make the state local.** Pull the logic out of the state (section 7) and pass the dependency in.
   The tests in `parking/contract/` touch no state at all, which is why `node --test` can run every
   file in its own process at once and nothing needs a lock.
2. **Shard it.** Give each worker its own slice, with a key it owns: a schema named for the worker,
   a lot the test creates and drops, a container per job. `F-1` — each fault mode settable per
   sensor — is what makes sensors shardable. One sensor shared by two tests that both set its mode
   is a race.
3. **Serialize it, and say so.** `--test-concurrency=1`, a lock, a mutex. This works and it does not
   scale. Write down why it was chosen so the next person can undo it.

Read-only global state is fine; a fixture nobody writes is repeatable. The dangerous combination is
*global* and *mutated*.

Two pieces of global state hide in plain sight:

- **The clock.** `Date.now()` is a global read that returns a different value every run. `T-1` bans
  unseeded randomness for exactly the reason it should ban the wall clock: a test whose inputs change
  without a change to the code cannot fail the same way twice. Inject the clock. The pivot in
  `docs/TEAM-AND-CLIENT.md` shows what it costs to learn this late — a thirty-minute hold that
  expires by a clock no test can set.
- **The reset.** `T-5` — one command returns the whole system to a known state — is the global-state
  fallback made cheap. `docker compose down -v` is it. It is a confession that some state is global,
  and the honest response to that confession is to make it cost ten seconds.

### The question you can ask

> "What does this test write, and who else can read it?"

---

## 4. Repeatability is a property of the environment

Same test, same state, different machine. Now the question is whether the *software around the
test* is the same.

### Containers: repeatable, almost

A container reproduces one machine: the filesystem, the toolchain, every library at the version it
was installed. `parking/` runs in one — `docker compose up --build` — and `T-5` is one command
because of it.

Two things make "the container is the same everywhere" a K4 rather than a K0, and both are worth
knowing exactly.

**An image tag is a family, not a file.** `node:20-alpine` on an M-series Mac pulls the `arm64`
variant; on a GitHub-hosted Ubuntu runner it pulls `amd64`. Same Dockerfile, two architectures, two
builds of every package inside. They behave the same almost always. Not always: native modules are
compiled per architecture; some packages have no `arm64` build and fall back to emulation, which is
slow and occasionally wrong; numerical libraries differ — Intel's MKL is x86-only, so even a CPU
build of a numerical package is a different artifact on `arm64`; and anything timing-sensitive runs
at a different speed. **A container makes the software identical and the machine similar.** There
are three honest choices: pin `--platform linux/amd64` and run under emulation on Apple silicon,
which is slow and makes the developer's machine the odd one out; build for both and test on both,
which GitHub's `arm64` runners now make ordinary; or accept *almost* and write down where it is
load-bearing. Any of the three is fine. Not knowing which one you chose is not.

**An image is only as repeatable as its inputs.** `node:20-alpine` floats to the newest 20.x at pull
time. `npm install` resolves fresh at build time unless a lock file is present and used. At this
writing `parking/app/` has no `package-lock.json`, and `app/Dockerfile` copies only `package.json`
before running `npm install` — so two builds a week apart can contain different versions of
`express`, `jsonwebtoken`, and `pg`, and nothing in the repository records which. The container is
repeatable at the level of the operating system and not at the level of the code. That is a
finding, not an accusation, and section 5 is the fix.

### Meta package managers: repeat the decision, not the machine

`conda` and `pixi` take the other approach. Describe the environment as **constraints** —
`python >=3.12,<3.14`, `pytorch >=2.13,<3` — and let a resolver produce a **lock** that records one
exact resolution *per platform*. A container reproduces one machine. A lock reproduces one decision
procedure, run separately on every machine.

That is the right tool whenever something genuinely varies across the machines your users have. The
`ml/` demo in the [languages course repository](https://github.com/wmacevoy/languages-wmacevoy-fall-2026)
is the worked example, and its table of when a container is the wrong tool is worth repeating:

| Condition                          | Why a container fails                                          | Example                          |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------- |
| dependencies differ by hardware    | an image pins one answer; GPU passthrough is Linux and NVIDIA only | CUDA vs. Metal vs. CPU        |
| the toolchain is too big           | multi-gigabyte images, painful to rebuild and ship             | Android SDK, Flutter             |
| it has a real user interface       | X11 forwarding is a poor substitute for a native window        | RStudio, IDEs, notebooks with plots |
| it needs host resources            | devices, licences, and credentials do not cross the boundary   | serial ports, GPUs, cameras      |

Stay with a container when the build is hermetic, hardware-independent, and the target is Linux
anyway. Both tools answer the same fear — "it works on my machine" — and reproduce different things.
If nothing varies across your users' machines, the container gives the stronger guarantee.

---

## 5. What to pin: the major and the minor, not the revision

The position, stated plainly: **in the manifest, say what you are compatible with. In the lock,
record what you ran. Commit both.**

```
manifest — a promise about compatibility      lock — a record of one resolution
express    ^4.19        (>=4.19, <5)           express  4.19.2   sha512-…
pytorch    >=2.13,<3                           pytorch  2.13.0   cpu_mkl_py312_h999dc20_102
```

Semantic versioning is the interface: the major changes when something breaks, the minor when
something is added, the revision when something is fixed. That is `V-4` in `REQUIREMENTS.md`, applied
by strangers to their own libraries. So the manifest names the major — the promise you depend on —
and the minor — the floor of features you actually use — and leaves the revision to the resolver.
The lock pins the revision, and the hash, so that everyone who installs gets the same bytes and
continuous integration resolves exactly what you tested.

Why this and not one of the alternatives:

| Policy in the manifest                         | Repeatable?                                    | When a CVE lands in a dependency                                                              | What actually happens                                                                                       |
| ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| nothing pinned — `*`, `latest`                 | no; every install is a different resolution    | you already have the fix, and every breaking change too, discovered in production             | green on Tuesday, red on Wednesday, no commit in between                                                    |
| the revision pinned — `4.19.2`                 | yes, by hand                                   | someone edits every pin in every repository, by hand, after reading every changelog           | in practice, **never**. The pins rot, the CVEs stay, and "we're on 4.19.2" becomes a fact nobody wants to look at |
| **major.minor in the manifest, the revision in the lock** | yes, by the lock                    | `npm update` or `pixi update`, run the suite, commit the new lock — **an hour**               | the fix arrives as a reviewable diff, revertible in one commit                                              |

The difference between the last two rows is the difference between eliminating most security
problems in an hour and, commonly, never. Both rows are repeatable. Only one of them survives.

That is the balance the policy strikes: **repeatability against survivability.** A fully pinned
manifest is maximally repeatable and dies of neglect. An unpinned one is maximally current and never
the same twice. Major.minor plus a lock is the point on the curve where both are affordable. It is
not free, because semantic versioning is a promise made by strangers and revisions do sometimes
break things, and two practices are what keep the promise honest:

- **The update is followed by the suite.** The test suite is what makes taking a fix an hour instead
  of a project. This is the sentence that ties the document together: *the quality of your tests
  sets the price of every security fix you will ever take.* A team with a suite it trusts merges the
  dependency update the day it appears. A team without one leaves the pull request open for a year,
  which is the "never" row wearing a different costume.
- **The update is scheduled.** Like deletion, it earns no credit and so it has to be somebody's named
  job, or a bot's — Dependabot, Renovate, a Monday task. A lock file that is never regenerated is a
  revision pin with extra steps.

The same policy applies one level up. `node:20-alpine` pins the major of the runtime, and
`docker compose pull` followed by a rebuild is the update. The languages course's Rust demo floats
its toolchain on `stable` and says in its README that a new release can turn the badge red without a
change in the repository — the same trade-off, made the other way, with the reason written down. What
is not acceptable is the unwritten version: a machine that works because of what happens to be
installed on it.

For `parking/`, the fix for the finding in section 4 is three lines. Generate `app/package-lock.json`
and commit it. Copy it into the image beside `package.json`. Replace `npm install --omit=dev` with
`npm ci --omit=dev`, which refuses to run when the lock and the manifest disagree. That is the whole
distance from *almost repeatable* to *repeatable, and survivable*.

---

## 6. Testing what runs somewhere else

### The idiot light for a repository

Continuous integration is the idiot light with a URL, and the badge on a README is pin 13. It retires
two fears — "it works on my machine" and "we only ever built it on one kind of machine" — and two
rules make it worth trusting:

- **CI runs the same command you do.** If the workflow's build step is `./build.sh` and so is yours,
  there is no second recipe to drift. `CONTRIBUTING.md` names the three checks CI runs for
  `parking/` — signed commits, `parkctl conform --all --json`, and the integration compose — and all
  three are commands a person runs by hand. None of them is in a workflow file yet. By the
  repository's own rule that is work to be done, not an error in the document.
- **The gate is in the script, not only in the workflow.** A build script that runs the tests and
  stops on failure cannot produce artifacts locally that CI would have rejected.

### Platforms: build there, and run there

Compiling for a platform and running on it are different tests, and a cross-compiler can only make
the first claim. The languages course's C++ demo builds and *runs* the same program on six legs —
Linux, macOS, and Windows, each on `x86_64` and `arm64`, each on a runner whose processor really is
that architecture — with `fail-fast: false`, because when it breaks the interesting question is
always *which* platforms broke, and stopping at the first one hides that.

The matrix is the container nuance from section 4 taken seriously: if you ship to two
architectures, test on two.

Two honest caveats, from that repository's own notes. A toolchain that floats on `stable` can turn
the badge red without a change. And a path-filtered workflow never starts for commits outside its
path, which reads as *pending forever* if it is ever made a required check.

### User interfaces

UI tests fail for one reason more than any other: they are global-state tests in disguise. A shared
server, a shared browser, the real clock, and animations that take a variable number of
milliseconds. Every fix in section 3 applies — one server per job, one browser context per test,
injected time — and one fix from section 7 applies first: **pull the logic out of the UI.**
`app/public/app.js` never computes `available`; the server derives it in one SQL fragment, and that
is *why* the number can be tested without a browser. The translation lookup `t(key, params)` is a
pure function of a key and a table; test it as one.

Then three loops, cheapest first. Push each class of error down to the cheapest loop that can catch
it:

| Loop                                                    | Latency | Catches                                                              | Tool                                                |
| ------------------------------------------------------- | ------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| the logic behind the UI, as functions                   | seconds | a wrong derivation, a wrong lookup, a wrong state machine            | `node --test`                                       |
| the DOM, in a headless browser, against the real server | minutes | the wiring: the click reaches the route, the response reaches the page | Playwright or headless Chrome against `docker compose up` |
| a person, driving the real thing                        | days    | the wrong product                                                    | the demo, in `docs/TEAM-AND-CLIENT.md`              |

Assert on text and state, not on pixels. A screenshot comparison fails when a font is hinted
differently on `arm64`, which is the container nuance arriving through a side door.

### Deployments

A deployment is a test whose failure is an outage. The pattern is already in `REQUIREMENTS.md`,
written for firmware and true everywhere: **a deploy is not finished when the bits land; it is
finished when the thing reports healthy, and the system should be the one to notice** (`G-5`).
Health-gated, with automatic revert, with the rollback timed before the window opens (`E-8`).

In GitHub Actions terms: a staging environment brought up from the same compose file; `/health`
polled with a timeout as the power-on self test; the integration suite run against it; promotion
only on green. The deploy script is the one you run by hand. And the maintenance window is a state,
not a fault (`E-9`) — a deploy that turns the dashboard red every night teaches the operators to
ignore red.

---

## 7. Serve, don't rule

The guidebook's last argument is the one that changes how code gets written. Tests observe code, and
measuring something changes it — but the useful change is not in the code under observation. It is
in the habits of the person writing it, who starts to write code that is easier to observe.

The example is a temperature. One version marches from the analog pin to Fahrenheit in a single
function that is wrong somewhere, with no way to find out where. The other separates the *rule* —
the two lines that touch the pin and the global — from the *serve* — three pure conversions, each
testable against a number you can look up. A good compiler emits the same code for both.

`parking/` is built on this rule at every layer:

- The signing string is a pure function of a reading (`contract/signing.js`), so `S-8` has a test
  that runs in a millisecond and needs no key, no sensor, and no network.
- `available` is derived in one SQL fragment, not stored, so it can be wrong in one place instead of
  five.
- Skew is arithmetic — `(receipt − as_of) − age_ms` — computed from three numbers a test can choose.
- The collector is a library, not a service, so it can be called in-process with a fetch function
  that lies.
- `contract/` holds no state at all, and every one of its tests is free.

The ratio of serve to rule is the testability of a design, and the diagnostic runs backwards: **if
something is hard to test, that is information about the design, not about testing.**

---

## 8. Three lessons the guidebook ends with

**Slow and steady wins the race.** Solve problems in parts you can test; test the parts together;
keep the parts and their tests when you are done, because the hot dog cart is going to become a taco
stand. Everybody's does. In this repository the taco stand has a name — the VIP pivot in
`docs/TEAM-AND-CLIENT.md` — and what survives it is exactly the code that was built in testable
parts.

**A journey of a thousand miles begins with a map.** Planning every detail is a waste; so is charging
into the woods. The map is the tests: if you do not know how to make a thing work, write the tests
that would pass when it does, and they will tell you what the thing is — including what it does not
have to be. `T-3` is this as a rule: every "must" has a test that names it. `F-6` is this for
adversaries: demonstrate the attack before building the defense, because a defense against an attack
nobody has performed is a K3 with a code review.

**Your momma writes better tests than you.** You cannot see past your own design. The only things
that find K3 are reality and a person who does not share the assumption — a reviewer, the client at
a demo, the attacker in `F-6`. Have other people say what needs testing. Take their advice.

---

## Checklists

**Before trusting a test suite**

- [ ] Every test owns its state, or owns a unique shard of it.
- [ ] The suite passes in any order and in parallel. Try it; `node --test` already runs files in
      parallel.
- [ ] No wall clock, no unseeded randomness, no fixed port.
- [ ] Every test has been seen red.
- [ ] CI runs the command you run, on every platform you ship to.

**Before trusting an environment**

- [ ] The manifest names the major and the minor; the lock names the revision; both are committed.
- [ ] The install refuses to run when the lock and the manifest disagree: `npm ci`, `cargo --locked`,
      `pixi install --locked`.
- [ ] The base image pins its major; the architectures you ship to are written down and tested.
- [ ] The update is somebody's named job, and the suite runs after it.
- [ ] One command returns everything to a known state.

**Before trusting a deploy**

- [ ] A power-on self test: a missing precondition is an exit code.
- [ ] A health check with a timeout, and an automatic revert when it is not met.
- [ ] The rollback has been run, and timed.
- [ ] The deploy script is the one you run by hand.

---

## The whole document as questions

| Ask                                                              | And you are checking                          |
| ---------------------------------------------------------------- | --------------------------------------------- |
| "Which fear does this test retire, and have I seen it fail?"     | that the test is real (1)                     |
| "Does the thing say so when it is broken?"                       | the second half of reliability (2)            |
| "What does this test write, and who else can read it?"           | local, sharded, or a race (3)                 |
| "Which architecture did CI actually run on?"                     | how much *almost* is in your container (4)    |
| "What does a CVE in a dependency cost us, in hours?"             | survivability (5)                             |
| "Is CI running the command I run?"                               | that the badge means something (6)            |
| "What is the rule here, and what could serve?"                   | the testability of the design (7)             |
| "Who besides me has said what needs testing?"                    | your momma (8)                                |

---

## Where this shows up in `parking/`

| Idea                          | Where it is made concrete                                                       |
| ----------------------------- | ------------------------------------------------------------------------------- |
| The power-on self test        | `db.js` exits; the `JWT_SECRET` fallback is the counterexample                  |
| Status                        | `S-5`, `C-4`, `parkctl conform`                                                 |
| The mock that misbehaves      | `F`, `T-2`, `T-4`                                                               |
| Local state                   | `contract/` — no state, and tests that run in parallel for free                |
| The reset                     | `T-5`; `docker compose down -v`                                                 |
| The clock, injected           | `T-1`; `age_ms` from a monotonic source                                         |
| The lock file                 | not yet — `app/package.json` with no lock is the open finding in section 4     |
| The health-gated deploy       | `G-5`, `E-8`, `E-9`                                                             |
| Serve, don't rule             | `contract/signing.js`; `lotSelectFields` in `app/index.js`                      |

---

## Reading

- **The ArduinoUnit guidebook, "The Zen of Testing"** — `guidebook.md` in the
  [ArduinoUnit repository](https://github.com/mmurdoch/arduinounit). The source of this document,
  written for a device with two kilobytes of RAM, which is why it could not afford to be vague.
- **Martin Fowler, "Eradicating Non-Determinism in Tests" (2011)** — section 3 with more cases:
  shared fixtures, asynchrony, time, and resource leaks, each with the fix.
- **Michael Feathers, *Working Effectively with Legacy Code*** — "seams": serve, don't rule, applied
  to code that already exists and cannot be rewritten first.
- **Kent Beck, *Test-Driven Development: By Example*** — the map before the journey, as a daily
  practice.
- **Semantic Versioning**, semver.org — the promise in section 5, in eleven rules, and the reason a
  revision may float.
- **Reproducible Builds**, reproducible-builds.org — how far *repeatable* can actually be pushed, and
  what it costs to get the last bit.
- **Michael Nygard, *Release It!*** — timeouts, health checks, and the deploy as a test, with the
  patterns named.
