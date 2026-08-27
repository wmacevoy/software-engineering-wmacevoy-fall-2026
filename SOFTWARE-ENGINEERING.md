# Software Engineering

What this course thinks the discipline is, and why the rest of the repository is shaped the way it
is.

| Document                  | Answers                                  |
| ------------------------- | ---------------------------------------- |
| `SOFTWARE-ENGINEERING.md` | why we work this way                     |
| `AGENTS.md`               | how agents work here                     |
| `CONTRIBUTING.md`         | how a change is accepted                 |
| `parking/REQUIREMENTS.md` | what the system must observably do       |
| `parking/DESIGN.md`       | how we intend to achieve it              |

Nothing in this file is checkable by continuous integration. That is exactly why it has to be
written down: the parts of engineering that no tool enforces are the parts that get lost, and then
rediscovered at full price.

---

## What engineers are for

**Engineers make reliable things, on time, within resource constraints, in a way that manages
discomfort for the team, the client, and the users.**

Four constraints that trade against each other, and a fifth — scope — that is usually the honest one
to move. A plan that does not say which of them is fixed is not a plan; it is a wish with dates
attached.

Note that *reliable* is not *correct*. Correctness is a property of a program measured against a
specification. Reliability is a property of a system running in a world that contains bad inputs,
hostile inputs, failing hardware, wrong clocks, partial networks, and people. The gap between those
two words is where most of the work is, and `parking/` is built almost entirely inside it.

### Discomfort is a first-class variable

| Whose      | What it looks like                              | What reduces it                          |
| ---------- | ----------------------------------------------- | ---------------------------------------- |
| The users  | confusion, wasted time, distrust of the answer  | the product actually being good          |
| The client | surprise                                        | frequent, honest, boring status          |
| The team   | fear, thrash, heroics, weekends                 | slack, small steps, reversible decisions |

This is not about comfort as a goal. Fear degrades judgment, and a frightened team abandons exactly
the practices that would have prevented the fear. Discomfort is a leading indicator — usually the
earliest one available, arriving weeks before the schedule shows anything.

---

## Most of practice is being less nervous

Backups. Version control. Tests. Code review. Short iterations. Client demos. Staging environments.
Each is normally taught as a rule to follow. Each is better understood as a way of retiring one
specific fear, and you should be able to name which.

| Practice                | The fear it retires                          |
| ----------------------- | -------------------------------------------- |
| Backups                 | "I could lose the work."                      |
| Version control         | "I can't get back to when it worked."         |
| Tests                   | "I don't know if I just broke something."     |
| Continuous integration  | "It works on my machine."                     |
| Short iterations        | "We are building the wrong thing."            |
| Client demos            | "They will hate it in month six."             |
| Code review             | "Only one person understands this."           |
| Signed commits          | "Nobody vouched for this code."               |
| Fault injection         | "I don't know what happens when it breaks."   |

Two consequences follow, and both are load-bearing:

- **A practice that reduces no one's anxiety will be abandoned under pressure.** Ceremony that costs
  time and returns no relief gets dropped in week ten, and it should be. If you cannot name the fear
  a practice retires, either find it or stop doing it.
- **A practice that reduces anxiety without reducing risk is worse than nothing.** A backup nobody
  has restored. A test suite that cannot fail. A green dashboard measuring the wrong thing. These
  are the most dangerous artifacts in engineering, because they spend the alarm and leave the danger
  in place.

---

## The taxonomy of unknowing

| #      | Category              | What it is                                              |
| ------ | --------------------- | ------------------------------------------------------- |
| **K0** | The known             | Things you know, that are true.                          |
| **K1** | The known unknown     | Things you know you don't know.                          |
| **K2** | The unknown unknown   | Things you didn't know you didn't know.                  |
| **K3** | Erroneous certainty   | What feels like K0 and is false.                         |
| **K4** | True falsehoods       | Things we hold as true, knowing they aren't, because they're useful. |

**K0 through K3 are in order of expense.** Looking something up is cheap. Researching a question you
have already framed is more. Being surprised costs a rewrite. Being confidently wrong costs whatever
was built on top of the belief, discovered at the worst possible moment. K4 is not on that ladder at
all — it is a choice, and a good one.

**Building something is the act of discovering, in the right order and at the right price, which
category each part of a problem domain belongs to.** Every practice in this repository is a way of
moving something down the ladder before it charges full price.

| From   | To     | How                                                                          |
| ------ | ------ | ---------------------------------------------------------------------------- |
| K0     | stays  | Write it down so it stays known: tests are executable knowledge, and unlike prose they complain when they go stale. |
| K1     | K0     | Spikes, prototypes, reading the source, asking the client. Cheap, and available on demand — the only category you can simply decide to spend money on. |
| K2     | K1     | Exposure to reality, early and repeatedly: integrate, deploy, demo, inject faults, watch real use. You cannot search for these; you can only arrange to be surprised sooner and more cheaply. |
| K3     | K0     | Evidence: a test that could have failed, an output you actually looked at, a signature you checked, a second person who does not share your assumption. |
| K4     | chosen | Name the falsehood, write down where it is load-bearing, know the blast radius when it comes due. |

### K3 is the one to be afraid of

K1 and K2 are honest. K3 is expensive precisely because it costs you nothing at the time — no search
is triggered, no question is asked, no ticket is filed. You are not looking, because as far as you
know there is nothing to look for.

Only two things find K3: reality, and someone who does not share your assumption. That is the entire
justification for running the code instead of reasoning about it, for integrating early, for review
by a person rather than by yourself an hour later, and for `F-6`, which requires every attack to be
*demonstrated before its defense is built*. "I verified the signature" is K3 until you have
personally forged a reading and watched the check reject it.

### K4: the falsehoods we keep on purpose

Every abstraction is a chosen falsehood. `parking/` holds a stack of them, and each is written down
somewhere in `REQUIREMENTS.md` precisely because it is false:

- The clock is correct. (`N-2`, `N-5`, and the `skewed` fault say otherwise.)
- The network delivers. (`C-1` exists because it doesn't.)
- The sensor is honest. (`F` is a catalogue of ways it isn't.)
- Capacity is constant. (`S-6`: a mismatch is a fault, not a correction.)
- The token reflects the user's current role. (It reflects their role up to eight hours ago.)

The engineering act is not avoiding these — you cannot build anything without them. It is choosing
them deliberately, recording them, and knowing what breaks when one comes due. An abstraction leaks
exactly where its falsehood was load-bearing. **A K4 you have chosen is an asset; the same falsehood
held unknowingly is K3.**

---

## Time

Tie a string to a rat that has learned one side of the cage is electrified, and measure how hard it
pulls away as it is drawn toward that side. The pull is not linear. It is nearly flat far out and
rises steeply as the distance closes — an *avoidance gradient*, roughly `1/x` in shape.

Deadlines do this to people. The month before ship feels like nothing; the last week is unbearable.
The exact curve is a metaphor, not a measurement, but the shape is the part that matters, and it has
a vicious property: **the spike arrives exactly when the project can least afford the behavior it
produces.** Skipped tests, bundled diffs, unreviewed merges, "we'll clean it up after launch." The
fear near the deadline destroys the practices that would have made the deadline survivable. That
feedback loop, not incompetence, is how most projects actually fail.

The engineering response is not willpower. It is to change the terrain.

- **Remove the danger.** If deploying is routine and reversible, the shore stops being electrified.
  An always-releasable trunk means shipping is not an event.
- **Build the bridge.** A thin end-to-end slice — click to route to SQL to response — built early
  and then thickened, crosses the gap. Horizontal layers all finish at the same time: never.
- **Put small fences along the way.** Intermediate checkpoints flatten the curve, but only if they
  are real. A demo to an actual client, a conformance run that exits nonzero, a deploy that
  happened. A status meeting is not a fence; it discharges no fear, because nothing was proved.
- **Keep slack.** A plan at full utilization has no capacity to absorb K2, and K2 is guaranteed.
  Queues do not degrade gracefully near full utilization; latency goes to infinity. Slack is not
  waste, it is the budget line for the unknown unknown.
- **Estimate the category, not the task.** "Two days" usually means "two days if nothing I haven't
  thought of happens" — a K0 statement about a schedule governed by K2. Work sitting in K0 estimates
  well. K1 work estimates as a range. K2 work cannot be estimated at all, only time-boxed. Say which
  kind you are handing over.
- **Bad news early is a gift; bad news late is a betrayal.** A two-week slip found in week two is a
  planning problem. The same slip found in week eleven is a crisis. The delay in reporting, not the
  slip, is what makes it expensive — and hiding it is the most common way engineers create the
  client discomfort they were trying to avoid.

---

## The cost of testing changes everything

**The structural difference between software engineering and the other engineering disciplines is
the cost of a test.** You cannot build a second bridge to see whether the first one stands. A wind
tunnel hour is expensive, a mask set is expensive, a recall is catastrophic. So those disciplines
front-load everything — analysis, simulation, review, sign-off — before anything is cut. Waterfall
is not a bad habit inherited from the 1970s; it is the correct response to a test that costs a
million dollars and takes a year.

Software's tests can be free, run in a second, and run ten thousand times a day. Nearly everything
filed under "agile" is downstream of that single fact. Three things follow that are usually left
out:

**1. It is per decision, not per project.** Both regimes live inside this one repository. Changing a
route handler is seconds to verify. Changing a schema under a database with real data in it is not
(`V-7`). A released firmware image cannot be recalled (`G`). A private key that has leaked cannot be
unleaked (`I-2`, `I-7`). A published interface with users on it is a promise (`V-4`). So you run
waterfall locally, around the expensive-to-test decisions — think it through, review it, get it
right the first time — and agile around the cheap ones. Methodology is a function of the cost of
being wrong once, and that cost can change twice in an afternoon.

**2. The cost of a test is designed, not given.** Lowering it is ordinary engineering work with a
known toolkit: pure functions, deterministic seeds (`T-1`), faults driven through a control plane
instead of waited for (`F-1`, `T-2`), one command back to a known state (`T-5`), conformance
checkable from outside (`T-4`), and logs that record the inputs that drove a decision so a failure
explains itself (`C-9`). **Lowering the cost of a test is often the highest-leverage work available,
because it multiplies against every future change.** And the inverse is diagnostic: *if something is
hard to test, that is information about the design, not about testing.*

**3. Testing is one feedback loop among several.** Each has a cost, a latency, and a fidelity, and
they catch different classes of error:

| Loop                  | Latency        | Catches                                    |
| --------------------- | -------------- | ------------------------------------------ |
| Running the thing     | seconds        | "it doesn't work at all"                    |
| Unit test             | seconds        | broken logic, regressions                   |
| Integration test      | minutes        | wrong assumptions between components        |
| Human review          | hours          | unclear intent, missing cases, bad design   |
| Client demo           | days           | building the wrong product                  |
| Production telemetry  | live           | everything you didn't imagine — at the worst possible price |

Push each class of error down to the cheapest, fastest loop that can catch it. But notice that some
errors are only catchable by an expensive loop: no test suite in the world detects "we built the
wrong thing." Only a person looking at it does.

Two properties of a loop matter more than its coverage:

- **A test that cannot fail proves nothing.** Watch it fail first — which is why `CONTRIBUTING.md`
  requires that the test fail without the change. A test written after the fact, never observed red,
  is a K3 generator with a green checkmark.
- **A loop you do not trust is worse than none.** Flaky tests train a team to ignore red, and after
  that the suite that would have caught the real one has been disarmed. `T-1` bans unseeded
  randomness for this reason, not for tidiness.

---

## Failure is an input, not an exception

Most specifications describe the happy path and inherit the rest by accident — whatever the HTTP
library happens to do on timeout becomes the product's behavior, chosen by nobody.

For every input a component depends on, four cases need a stated answer: **absent, late, wrong, and
lying.** `parking/` exists to force those four questions on every consumer, which is why the sensor
is a designated liar with a switchboard.

A system that only works when its inputs behave is not finished. And an adversary is just the
unknown that optimizes: **security is this same discipline applied to an input chosen specifically
to find your K3.**

---

## Interfaces, reversibility, and the installed base

- **Spend deliberation in proportion to reversibility, not to how interesting the decision is.**
  Renaming a variable is free to undo. A data format with data already in it, a published URL, a
  distributed key, an artifact someone installed — those are one-way doors. Most arguments in
  software are conducted at the wrong intensity for their reversibility.
- **The moment a second party depends on your interface, it stops being a decision and becomes a
  promise.** `V-4` is that idea made precise, and versioning (`V-1`–`V-5`) is the mechanism for
  keeping the promise while still being allowed to change.
- The property being engineered is the **cost of the next change**. Anyone can write the first
  version. The design shows its worth in the second, which is also when nobody remembers why the
  first was shaped that way — so write that down while you still know.

---

## Provenance

Every claim in a system has an author, and the question that runs through this entire repository is:
**who said this, and can I check it later without asking them again?**

It is the same question at every layer — a reading (`S-8`, `I-5`), a log record (`L-9`), a firmware
image (`G-2`), a commit (`CONTRIBUTING.md`). The device registry and `.github/allowed_signers` are
the same structure one layer apart, and noticing that is the point.

Provenance is the mechanical answer to K3. "I'm sure this is right" is a feeling. "This is signed by
a key in the registry, and here is the check" is evidence. And on the human side, a signature is a
person saying *I have read this and I stand behind it* — which cannot be delegated, and which the
arrival of capable agents makes more important rather than less.

---

## Scale, recovery, availability

Three questions the system answers at runtime whether or not anyone wrote them down. Unstated, the
answer is whatever the implementation happened to do — chosen by nobody, and discovered in
production.

| Requirement      | The question that forces it                                          | An answer looks like             |
| ---------------- | -------------------------------------------------------------------- | -------------------------------- |
| **Scale**        | How many actual users? And lots, readings a second, rows in a year?   | an order of magnitude, plus a horizon |
| **Recovery**     | What happens when X breaks — and what does it take to get back?       | a procedure someone has run and timed |
| **Availability** | How much downtime is tolerable, for whom, per what period?            | a number with a period           |

**Scale.** "A city" is not a number. Eight lots, one sensor each, a reading every thirty seconds,
twenty thousand drivers on a Friday evening, ninety days of history — those are design inputs; the
first is a mood. Precision is not the point; the order of magnitude is, and so is everyone holding
the same one. Postgres and a five-second poll is the obviously right answer at ten lots and an
obviously wrong one at a million sensors, and nothing about the code says which world it is in. Ask
for the number *and its horizon* — "and in two years?" — then write down the number you are
explicitly **not** designing for, which is the cheapest scope decision available and ends the same
argument permanently. The number is K4: false the day you write it. Written down it is an asset with
a known blast radius; assumed, it is the K3 that rewrites get named after.

**Recovery.** "What happens when X breaks" is two questions, and the second is the one that gets
skipped. First: what does the system do *while* X is down — degrade, wait, refuse, serve stale, and
does the user learn which? That is what `C` and `U-1` are for. Second: what does it take to get
back — who does it, with which command, from which backup, and how long does it take? That answer is
real only if someone has run it and timed it; a restore procedure nobody has executed is the
canonical anxiety-reducing artifact with the risk left in place. Answer both per component, not for
"the system": the answer for a sensor (poll it again in five seconds) is nothing like the answer for
the database (restore, and lose everything since the last backup — how much is that, in minutes?).
That last figure is itself a requirement, not a consequence: **how much data may we lose** has to be
decided by someone entitled to decide it.

**Availability.** Downtime tolerance is a budget with a period and a beneficiary: the driver-facing
page may be down four hours a month; the ops UI may be down a day; a single missed poll bothers
nobody. Different components deserve different budgets — that is exactly what lets you spend the
money where it matters. Two things make this worth forcing early:

- **The unstated default is 100%**, which is the most expensive requirement you can accidentally
  accept, and it quietly forbids deploys, restarts, and schema migrations (`V-7`). A team that never
  gave itself a maintenance budget cannot do the "remove the danger" move from the Time section,
  because every release is an incident.
- **The number chooses the architecture** — mostly by choosing whether a human is allowed in the
  loop at all:

| Budget  | Down per month | What it implies                                       |
| ------- | -------------- | ----------------------------------------------------- |
| 99%     | 7 hours        | a person can notice and fix it                         |
| 99.9%   | 43 minutes     | alerting that pages, and a runbook someone has run     |
| 99.99%  | 4 minutes      | no human in the loop: redundancy and automatic failover |

None of these three is ours to choose alone — they are client answers, and on day one each costs one
sentence. Later they cost a migration, a rewrite, or an outage, in that order.

---

## Security, ethics, and law are requirements

Three more permanent members of the requirement set, and the easiest of all to postpone: no user
files a ticket for them, they compete against visible features, and their absence looks exactly like
their presence right up until it doesn't.

Two properties make deferring them a mistake rather than a trade-off:

- **Their deadline is set by someone else** — a breach, an audit, a complaint, a regulator, a
  journalist. You do not get to schedule it into the next sprint.
- **Violations are the irreversible kind.** Data that leaked cannot be unleaked. A person harmed is
  not fixed by a patch. These are one-way doors, and the earlier section applies at full force.

In practice:

- **Security.** Write down the threat model: who the adversary is, what they can do, what they want.
  Then design against that, not against a vague sense of danger. Every dependency is a transfer of
  trust and a permanent obligation; know where you have placed it and why.
- **Law.** Mostly about data — what you collect, how long you keep it, who you must notify, what you
  may reuse. Also licensing and the provenance of code, which now includes code an agent produced.
  Note that `A-5` puts retention deliberately outside the reach of any API: that is a legal design as
  much as a security one.
- **Ethics.** The people affected who are not in the room — non-users, bystanders, the surveilled.
  Parking data is location data about people. *"Counts, not locations"* in `REQUIREMENTS.md` is an
  ethical decision wearing technical clothes: it is nearly free to make now and nearly impossible to
  retrofit later. Data minimization is the cheapest protection that exists — the safest record is
  the one you never kept. Accessibility and translation live here too (eight language packs are not
  decoration), as does the question of what the system does to the person whose lot shows the wrong
  number.

**The cheapest moment to satisfy all three is while the requirements are still soft.** After that
you are not adding a requirement, you are performing a migration.

---

## People are part of the system

- **Coordination cost grows faster than the team.** Adding people to a late project makes it later.
  The fix is smaller, clearer interfaces between people — not more meetings.
- **The system will resemble the communication structure that built it.** If that is going to happen
  anyway, choose the structure on purpose.
- **The deliverable is not the code.** It is the code plus the ability of someone else to run it,
  reset it, deploy it, diagnose it at 3am, and continue it in month seven. "It works on my machine"
  is a claim about a machine.
- **Maintenance is most of the total cost**, and the reader you are writing for is most often
  yourself, having forgotten. This is why `AGENTS.md` treats attention as the scarce resource.
- **Write down what you decided not to do.** The `Scope decisions` and `Non-goals` sections of
  `REQUIREMENTS.md` are the cheapest documentation in this repository: they end the same argument
  three times and tell the future why the obvious thing was not done.
- **Distribute discomfort deliberately and visibly** — on-call, review load, the tedious work.
  Burnout is a systems failure with a schedule, not a personal failing, and it shows up as
  attrition, which is the uncontrolled deletion of K0 with no backup.

---

## Working with agents

An agent is an extremely fast writer with no stake in the outcome. It moves the economics of this
discipline in exactly one direction: **the cost of producing code has fallen much faster than the
cost of knowing that the code is right.** Everything scarce therefore migrates to the second half —
specification, verification, review, ownership.

In the taxonomy, an agent is a K3 factory. Fluent, confident, plausible, and occasionally wrong is
the precise shape of erroneous certainty, now arriving faster than you can check it. That is not an
argument against using agents. It is an argument about where to spend the time they save.

- **Spend the speed on lowering the cost of testing** — fixtures, harnesses, seed data, fault
  scripts, conformance checks, the boring second test case. That work multiplies. More features do
  not.
- **Review capacity is now the bottleneck.** Ask for diffs you can actually read, one concern at a
  time.
- **Never let confidence substitute for a run.** "This should work" is K3 by construction.
- **Delegation is not abdication.** You sign it, so you own it — and if you cannot explain it, you
  cannot maintain it or defend it. Working code you cannot explain is a liability in this
  repository, not an asset.

### Nothing important may live only in a head

A design constraint that exists only in a developer's head has always been a liability. It used to
be a survivable one: the person holding it sat nearby, saw the change, and said "no, not like that"
in the hallway. With agents in the loop that recovery path is gone. An agent is not in the hallway,
does not know the constraint exists, and will hand you a clean, tested, plausible violation of it
faster than you can read the diff.

So the state of the project has to be **observable from where every party stands** — the client, the
humans, and each agent, which arrives knowing nothing and leaves remembering nothing. An unwritten
constraint fails in both directions at once: the holder's belief that everyone knows it is K3, and
for everyone else it is K2 — you cannot ask about something you have no idea exists.

### The working set

What "observable" requires will keep changing as the tools do. Today it means four documents, in the
repository, versioned alongside the code — not in a wiki, not in chat history, not in a notebook:

| Document          | Answers                                                                     | Written by        |
| ----------------- | --------------------------------------------------------------------------- | ----------------- |
| `REQUIREMENTS_vX` | what must observably be true                                                 | us and the client |
| `DESIGN_vX`       | how we intend to achieve it, and what we rejected                            | us                |
| `QUEUE`           | what is being worked, in what order, by whom, and what would make it done    | us                |
| `FINDINGS`        | what we learned the expensive way — surprises, dead ends, measurements, the attack that worked | reality |

- **`_vX`, because a superseded requirement is not deleted knowledge.** Editing in place destroys
  the before-picture, and the diff between two versions is the most useful conversation the client
  ever has with you. Same idea as `V-4` one layer up: once a second party depends on a statement,
  changing it is a version, not an edit.
- **`QUEUE` is the shared cursor.** Without one, two workers do the same task twice, or each assumes
  the other has it. That failure was always possible with people; it is now cheap to hit ten times
  in an hour.
- **`FINDINGS` is the K2/K3 ledger,** and the only one of the four that reality writes. A fact
  discovered at full price and not written down gets rediscovered at full price. An agent has no
  memory of last week's dead end — and increasingly, neither do you.

These are not project-management ceremony. Each retires a specific fear — "we are building different
things," "nobody knows what state this is in," "we already learned this once" — and by the earlier
rule, a document that retires no fear should be dropped rather than maintained.

### Context is a budget, and it resets every session

An agent starts from nothing, every time. On a real system it cannot read the project to find out
what is going on: it does not fit, and even where it fits, reading everything in order to change one
thing is the wrong price. So *how does a competent stranger find the five files that matter, in ten
minutes, without reading the other five hundred?* stops being a nicety and becomes a load-bearing
property of the repository.

The good news is that this is the same property that makes a codebase habitable for people. Clear
component boundaries, a README per component stating its contract, stable IDs like `S-8` that grep
from a test back to the sentence that demanded it, a dependency rule that can be checked
mechanically, names that mean what they say — humans navigate by these, and so do agents.
**Factoring done for human comprehension pays twice.**

The bad news is that several conventions that genuinely helped human readers now cost real money:

| Convention                               | What it costs now                                                        |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| A doc-comment on every function          | Spends context restating what the signature already says — and prose goes stale silently, where stale prose reads exactly like true prose. K3, pre-delivered. |
| One enormous file                        | Cannot be read in part, so every task pays for all of it.                 |
| Deep indirection in the name of reuse    | The seam-hiding tax, charged to humans and agents alike.                  |
| Commented-out code, historical asides    | Ambiguous authority: is this the specification, or the past?              |

The replacement is not "no documentation." It is self-documenting code, a hint exactly where the
code cannot say *why*, and everything durable in the working set, where both kinds of reader look.
That is the rule `AGENTS.md` already gives for comments; agents did not change it, they only put a
price tag on breaking it.

### Ask your agents

Models are changing faster than this document can. Any specific advice about how to prompt, how much
to hand over at once, or what an agent can be trusted to do unsupervised has a short shelf life —
the conventions just above included.

The durable move is to ask the model you are actually using: *what did you have to read that you
should not have needed? what would have let you get this right the first time? what did you assume
because nobody wrote it down?* Then put the answer in the repository rather than the chat, where the
next session — human or not — will find it. Treat it as a proposal from something with no stake in
the outcome, like any other advice here. But ask, because the alternative is a convention tuned for
a model that has already been retired.

---

## Where this shows up in `parking/`

| Idea                        | Where it is made concrete                                        |
| --------------------------- | ---------------------------------------------------------------- |
| Reliability vs. correctness | `C`, `F`, `U` — everything about inputs that misbehave            |
| K3 → evidence               | `F-6`: demonstrate the attack before building the defense         |
| K4, named and recorded      | `N` (clocks), `S-6` (capacity), the `skewed` fault                |
| Provenance                  | `S-8`, `I-5`, `L-9`, and signed commits in `CONTRIBUTING.md`      |
| Cost of testing, designed   | `T-1`, `T-2`, `T-4`, `T-5`, `F-1`                                 |
| One-way doors               | `V-7` (migrations), `G-3` (rollback), `I-2` (keys)                |
| Ethics in the requirements  | "Counts, not locations"; `A-5`; the language packs                |
| Fences, not heroics         | `npm run check`, `parkctl conform`, one-command reset             |
| Scale, recovery, availability | `E` — 100 lots, five seconds a day, one hour at 2am               |

---

## If you want the longer arguments

- Fred Brooks, *The Mythical Man-Month* — coordination cost, and why adding people makes it later.
- Fred Brooks, "No Silver Bullet" — essential versus accidental complexity.
- Richard Cook, "How Complex Systems Fail" — eighteen paragraphs, and the best return per page here.
- Michael Nygard, *Release It!* — failure as an input, with the patterns named.
- Nancy Leveson, *Engineering a Safer World* — safety as a system property, not a component property.
- Forsgren, Humble, and Kim, *Accelerate* — the measured case that fast feedback and reliability are
  the same variable, not a trade.
