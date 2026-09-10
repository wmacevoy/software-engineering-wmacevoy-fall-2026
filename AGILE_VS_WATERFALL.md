# Agile and Waterfall

The shape of software engineering: two orders for the same six steps, the one fact that decides
between them, the words people use, and the failure that looks exactly like progress.

| Document                  | Answers                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `SOFTWARE-ENGINEERING.md` | why the cost of a test is the first structural difference     |
| `AGILE_VS_WATERFALL.md`   | what shape that difference gives the work, and the vocabulary |
| `TESTING.md`              | what "(test)" means at each step                              |
| `docs/TEAM-AND-CLIENT.md` | the iteration, the demo, and the client                       |
| `parking/REQUIREMENTS.md` | a requirements document that stayed at the top of the waterfall on purpose |

`SOFTWARE-ENGINEERING.md` says that waterfall is the correct response to a test that costs a million
dollars, and that nearly everything filed under "agile" is downstream of software's tests being
cheap. It mentions waterfall and does not describe it. This document does, because the shape matters:
students do not fail by choosing the wrong methodology. They fail by sliding down the steps of the
one they did not choose, faster than they notice.

## Terms used here

| Term             | Meaning                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ |
| **K0–K4**        | The five kinds of not-knowing, from `SOFTWARE-ENGINEERING.md`. K2 is the unknown unknown; K3 is confident and wrong; K4 is a falsehood kept on purpose. |
| **Fence**        | A checkpoint that proves something: a demo, a deploy, a test that could have failed. A meeting is not one. |
| **One-way door** | A decision that cannot be cheaply undone: a schema with data under it, a published interface, a distributed key, a released image. |
| **Observable**   | Checkable from outside without reading the source. Requirements are written in it.        |

---

## 1. The same six steps

Both shapes are made of the same six steps, and the steps are in the right order in both. You
cannot design against a requirement you do not have; you cannot build a design you have not chosen;
you cannot deploy what you have not built.

| Step         | What it produces                                                          | The question it answers        |
| ------------ | ------------------------------------------------------------------------- | ------------------------------ |
| Requirements | numbered, observable statements of what must be true — and what is *not* being built | what, for whom, and how much |
| Design       | chosen mechanism: the tables, the protocols, the keys, the components, and what was rejected | how, and why not the other way |
| Develop      | code that a second person can read and defend                             | does it exist                  |
| Test         | evidence that the code does what the requirement says                     | does it work                   |
| Deploy       | the thing running where its users are, and a way back                     | is it out there, and healthy   |
| Maintain     | everything after: fixes, changes, upgrades, the next request               | is it still true               |

The disagreement between the two shapes is not about the order. It is about the **batch size** and
about **where the tests are**.

---

## 2. Waterfall, described

Waterfall runs the six steps once, in order, each finished and signed off before the next begins:

```
Requirements → Design → Develop → Test → Deploy → Maintain
```

Winston Royce drew it in 1970 and, two pages later, wrote that the implementation as drawn "is risky
and invites failure," because testing arrives at the end, where every surprise costs the most.
The industry kept the drawing and dropped the warning.

It is worth being fair to the shape, because outside software it is correct. A civil engineer cannot
build a second bridge to see whether the first one stands. A chip designer pays for a mask set once.
When the only real test costs a million dollars and a year, the rational response is to move
everything that can be checked *before* that test: analysis, simulation, review, sign-off, change
control, a requirements document that is frozen because changing it means re-doing the analysis.
Waterfall is what a discipline looks like when it cannot afford to be wrong twice.

| What waterfall retires                                   | What it creates                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| "we will spend the money on a design that was never checked" | "we will find out it was the wrong product at the end, at full price" |
| "the requirements moved under us"                        | "the requirements were frozen before anyone had seen the thing"  |
| "nobody signed off"                                      | "everyone signed off, and it was still wrong"                    |

The right-hand column is what happens when the shape is applied to work whose tests are cheap. K2 —
the surprise you could not have asked about — is guaranteed on every project, and waterfall
schedules its arrival for the last step.

---

## 3. Agile, described

Agile runs the same steps in loops, with a test inside every step rather than a Test step at the
end. Three loops, three latencies, three different instruments:

```
Release loop       (weeks; reality answers)
  Iteration loop   (days; a person answers; time-boxed, and scope is what moves)
    Requirements   (test: the client reads a precise claim and objects; K4s read back)
    Design         (test: a contract, a mock that misbehaves, a spike, a failing test)
    Develop        (test: red, then green — the seconds loop)
    Demo           (test: a person drives the real thing)              ← the fence
  Deploy           (test: health-gated, automatic revert, rollback timed)
  Observe          (production telemetry; what K2 arrived → FINDINGS)
  Delete           (what can we remove?)
There is no Maintain step. After the first deploy, every iteration is maintenance.
```

Five things about the shape are load-bearing:

- **"(test)" means something different at each step.** Requirements are tested by a person — the
  client reading a sentence precise enough to be wrong. Design is tested by artifacts that exist
  before the code: a contract two people can build against, a mock that misbehaves on request, a
  spike, a test that fails today. Develop is tested by red then green. Deploy is tested by a health
  check with a timeout and an automatic revert. Leave the label off and students will hear "unit
  test" four times. `TESTING.md` spells each one out.
- **The iteration ends on a fence, not on "done."** A fixed period — one to two weeks — that ends
  with a running thing in front of a human. When the period ends, scope is what moves. Without the
  time box the inner loop is not a loop, it is a spiral.
- **The demo is the only instrument for "wrong product."** No test suite detects that you built
  exactly what was asked and nobody uses it. A person driving the real thing does, and that is why
  the demo closes the inner loop rather than decorating it.
- **The outer loop's product is knowledge.** Deploy answers "does it survive reality"; Observe writes
  down what reality said (`FINDINGS`); Delete returns the carry nobody schedules. The distinctive
  output of agile is not more code sooner. It is K2 converted to K1 at the cheapest available price,
  in the right order.
- **Maintain is not a step because it is the loop.** Waterfall drew maintenance last and smallest and
  put most of the money there. Agile has no line between building and maintaining: the second
  iteration after the first deploy is the same shape as the first.

---

## 4. The distinction is the cost of a test

Everything in section 3 is legal for one reason: a test can be free, run in a second, and run ten
thousand times a day. That is what lets Requirements be wrong on Monday and corrected on Tuesday,
lets a design be a contract and a mock instead of a signed-off drawing, and lets Deploy be routine
instead of an event.

So the choice between the shapes is not a preference. It is **determined, per decision, by the cost
of being wrong once** — and both regimes live inside one repository:

| Decision                                       | Cost of being wrong once                         | Regime                                               |
| ---------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------- |
| a route handler, a translation string, a query | seconds to find out, seconds to undo             | loop: change it, run it, keep or revert              |
| the derived `available` column                 | every consumer, but all inside one repository    | loop, with the tests that name `S-1` and `U-1`       |
| a schema with real data under it (`V-7`)       | a migration inside a one-hour window (`E-8`)     | **waterfall, locally**: think, review, migrate once  |
| a published API with clients on it (`V-4`)     | a version served alongside the old one, forever  | waterfall: it is a promise now, not a decision       |
| a distributed private key (`I-2`)              | cannot be unleaked                               | waterfall, and a ceremony                            |
| what data about people you collect             | cannot be un-collected; a regulator sets the deadline | **waterfall, before anything else**              |

Read the right-hand column top to bottom and notice that the regime changes as the door becomes
harder to reverse. Around a one-way door you run a small waterfall *inside* the loop: get the
requirement exactly, design it on paper, review it with someone who does not share your assumption,
and do it once. Everywhere else you loop. Methodology is a function of the cost of being wrong once,
and that cost can change twice in an afternoon.

The last row is the subject of the next section, because it is the door students walk through
without noticing there was a door.

---

## 5. Falling down the waterfall

Here is the failure, and it looks like a productive week.

A team is asked for a campus parking app. By Tuesday there is a schema: `students(id, name, plate)`,
`vehicles(plate, student_id)`, `sightings(plate, lot, seen_at)`, third normal form, an index on
`(lot, seen_at)`, a view that joins all three, a query that answers "where did this student park
last Thursday" in eleven milliseconds. It is good work. Everyone is comfortable.

In week four the client is asked — late, in passing, per the intake question about who is affected
who is not in the room — whether student identity may be joined to a location. The registrar's
answer is no: not without consent, and consent is not on the table. Whether the rule is the federal
privacy law for student records, the institution's own policy, or a data-protection law that applies
because one user is abroad does not matter to the schema. What matters is that `sightings` cannot
exist in the form it has, the join is forbidden, the view is forbidden, the query is forbidden, and
the user interface built on the view has no data. The whole plan was misguided by a rule that lives
at the top of the waterfall, and the team spent four weeks at the bottom.

`parking/` carries the one-line requirement that would have saved the month: **"Counts, not
locations."** It is in `Scope decisions`, it has an ethical reason attached in
`SOFTWARE-ENGINEERING.md`, and no amount of database normalization would ever have produced it. It
comes from a question, not from a design.

### Why the slope is there

Software has no mass, so this is not gravity. It is the **comfort gradient**. Each step down the
waterfall is more concrete, more familiar, more solitary, and produces something you can see: a
table, a query, a screen. Each step up is more ambiguous, more social, and produces a document
nobody grades. Reading a privacy law is uncomfortable. Asking a registrar a question is
uncomfortable. Writing a sentence precise enough for a client to reject is uncomfortable. Normalizing
a schema is a pleasure.

`SOFTWARE-ENGINEERING.md` makes discomfort a first-class variable and says that people abandon the
practices that would have saved them at exactly the moment the fear peaks. This is the same
mechanism earlier in the project: people go where *their own* discomfort is lowest, which is the
bottom of the waterfall, and leave the client's and the users' discomfort — surprise, and a product
that cannot legally exist — for later. The slope of the waterfall is the developer's comfort
gradient, drawn as a diagram.

Agents make it steeper. An agent will produce the normalized schema, the indexes, and fifty queries
in a minute, and it will never ask about the registrar unless a requirement says to. It falls down
the waterfall at machine speed.

### The tells

You are falling when any of these is true before there is a numbered requirement the client has
objected to:

- There is a schema.
- There is a framework, a language, or a library chosen.
- There is a "temporary" table, column, or default.
- "We'll figure out login later." "We'll add the privacy stuff at the end."
- There is no `Non-goals` list, so nothing has been refused yet.
- Nobody can say who, outside the room, this system keeps a record about.

### The railing

The engineering response is the one the essay gives for fear: do not rely on willpower, change the
terrain. Put fences at the top of the waterfall so that descending early is visibly a violation
rather than an instinct.

1. **Ask the expensive questions first.** The questions whose answer could *invalidate* the plan
   come before the questions whose answer only *shapes* it. What data about people does this keep?
   Who is entitled to see it? What law or policy applies, and who says so? How many, and in two
   years? How long may it be down? What are we not building? Each is a sentence to ask and a month to
   discover. `docs/TEAM-AND-CLIENT.md` has the full list; this is the subset with a regulator
   attached.
2. **Write the answer where it cannot be missed.** `Scope decisions`, `Non-goals`, and a section of
   the requirements for security, law, and ethics — three permanent members of the requirement set,
   as the essay says, with deadlines set by someone else.
3. **Read the K4s back.** "We're assuming a record of where a person parked is fine to keep. True?"
   converts the whole example above into one sentence in week one.
4. **Only then descend — and descend on purpose.** A *spike* is a permitted descent: time-boxed,
   aimed at one question, its code thrown away. Falling is a descent with no question and no time
   box. The difference is whether you can say, before you start, what you will know when you stop.

`parking/` was built this way on purpose, and its history shows it: after the original demo arrived,
the first commits were the requirements, the design, the policy, and a contract — documents and a
layer-0 folder, before a single feature. The seven components that are still only READMEs are not
behind schedule. They are waiting at the top of the waterfall until their requirement is settled.

---

## 6. Requirement, or design?

Students have trouble telling these apart, and the confusion is expensive in a specific way: a
requirement cannot change without the client, and a design can. Put a design decision in the
requirements and you have promised the client a table name. Put a requirement in the design and it
can be quietly changed by whoever edits the file next.

Two questions separate them, and a sentence must pass both to be a requirement:

> **Could a different team satisfy this sentence a different way?**
> **Could you check it from outside, without reading the source?**

| Requirement (what must be observably true)                          | Design (the mechanism we chose)                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A stale count is never presented as current (`U-2`)                 | The collector stamps receipt time; staleness is computed from `age_ms`      |
| Every reading is attributable to a device (`S-8`)                   | Ed25519 over an ordered, pipe-joined signing string                         |
| One command returns the system to a known state (`T-5`)             | `docker compose down -v`                                                    |
| Revocation takes effect no later than the next poll (`I-4`)         | The collector reads the `devices` table every cycle, so there is no cache to invalidate |
| Student identity is never joined to a location                      | `sightings` has no `student_id` column, and no view that could add one     |
| A lot under maintenance reads as closed for service, not missing (`E-9`) | A `maintenance` state distinct from `down` in the derived-state enum   |

The tells that a requirement has design in it: a table name, a library, a language, an HTTP status
code, an endpoint path, an algorithm. The tells that a design has a requirement in it: "the user
must be able to," with no mechanism following. And the rule from `CONTRIBUTING.md`: a pull request
that edits a requirement to match what the code happens to do is a design change wearing a costume.

Keeping them apart is what makes the loop cheap. The design can be replaced in an iteration; the
requirement is renegotiated with a person. `DESIGN.md` says it in its first paragraph: every
mechanism there is replaceable without renegotiating a requirement.

---

## 7. From a user story to an API

The other thing students find hard is the middle: they can write a story and they can write an
endpoint, and they cannot see how one turns into the other. The chain has four links, and the third
is the one that gets skipped.

```
user story → acceptance criteria → acceptance test → observables the test needs → the contract
 who, what,    observable,            fails today       fields, states,               the API
 and why       numbered                                 endpoints
```

**A story** names a person, a want, and a reason: *As a driver arriving for an event, I want to see
which lots have space, so that I can go straight to one instead of circling.* The reason is the
part that matters; it is the pain, and the want is a guess about the solution.

**Acceptance criteria** turn it into observable sentences, each of which can be wrong: the page
shows a count per lot; a count older than the staleness threshold is shown with its age and never as
current; a lot whose data cannot be trusted reads as unknown, not missing. Those are `U-1`, `U-2`,
and `U-3` — a story became three numbered requirements.

**The acceptance test** is one of those sentences made executable, and it is written to fail today.
In the style of `T-2`, driven through the sensor's control plane:

```
set lot 3's sensor to `stuck`          # 200 OK, frozen as_of
poll past the staleness threshold
GET the driver view
assert lot 3 shows a count with an age, and is not marked current
```

**The observables** are what the test had to reach for in order to assert anything. To assert "with
an age," the driver view must expose an age. To assert "not marked current," it must expose a
state. To drive the fault, the sensor must have a control plane. So the test *forces* fields into
existence: `age_ms`, a derived `live`/`stale`/`unreachable`, `POST /control/mode`. Those fields are
the contract — `S-1`, `C-4`, and the control table in `REQUIREMENTS.md` — and they exist because a
test needed to observe them, not because someone thought they would be nice.

That is the whole trick. **An API is the set of observables your acceptance tests need.** Design the
tests and the API falls out; design the API first and you will ship fields nobody can test and miss
the ones somebody needed.

The VIP story from `docs/TEAM-AND-CLIENT.md` runs the same chain and shows it producing something
harder. *As a season-ticket holder, I want to hold a space for thirty minutes, so that I am not
circling when I arrive.* Criteria: a hold is visible to its holder with its expiry; the last space
goes to exactly one of two simultaneous requests; a retried request does not take a second space.
Tests: two concurrent holds, assert one wins; the same request twice, assert one hold. Observables
forced: an `expires_at`, an idempotency key on the request, and a race decided in one database
statement. The test for "exactly one wins" is what puts the decision inside the database rather
than in whichever request the load balancer saw first — the design was chosen by the test.

Two consequences:

- **A story with no test is a wish.** It cannot be wrong, so it cannot be finished.
- **A test with no story is accidental complexity.** It protects something nobody asked for, and
  it will be maintained forever.

`T-3` is this chain as a rule: every "must" has a test that names its ID. Grep the ID and you walk
from the test back to the sentence, and from the sentence back to the person.

### The scoreboard

The chain has a side effect that is worth more than it looks. When tests are named by the story or
requirement they serve, and grouped that way in the output, a test run stops being a count of passes
and becomes a board: *these stories are green, those are still red, this one turned green today.*
That is gamification — progress shown as a score people want to move — in the only form that is
honest, because every point on the board could have been lost. A team watches its own board turn
green in groups that mean *a driver can now do this*. A client reads the same board without reading
a line of code, and it is a fence they can check between demos. `T-3` gives `parking/` the board
for free: run `node --test` and the names carry the IDs, so sorting the output by `U-`, `C-`, `S-`
is sorting it by promise.

The board is only honest while the tests are. The moment a green can be produced without the
behavior — a test that asserts nothing, a skipped suite that reports success — the score detaches
from the thing it measured, and the game is being played against yourself.

---

## 8. The words people use

Each term with what it is, what it is *for* — the fear it retires, since a practice that retires none
will be dropped in week ten — and what this repository calls it.

| Term                        | What it is                                                                                          | The fear it retires                                    | Here                                    |
| --------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------- |
| **Iteration / sprint**      | A fixed period, one to two weeks, ending at a fence. Scrum's word is *sprint*.                      | "we are building the wrong thing, and won't know for months" | the iteration in `docs/TEAM-AND-CLIENT.md` |
| **Time box**                | The period is fixed; scope moves. The opposite of "until it's done."                                | "it will never end"                                    | the fence ends it                       |
| **User story**              | A person, a want, a reason, on a card. A pain plus a guess.                                         | "we lost the *why*"                                    | section 7                               |
| **Acceptance criteria**     | The observable sentences a story must satisfy, numbered.                                            | "we each heard something different"                    | the `U`, `C`, `E` requirements          |
| **Acceptance test**         | A criterion made executable, written to fail first.                                                 | "we think it's done"                                   | `T-2`, `T-3`                            |
| **Definition of done**      | The checklist a change must fully pass. Not most of it.                                             | "done means different things to different people"      | `CONTRIBUTING.md`                       |
| **Backlog**                 | Everything not yet done, in priority order, each item with a done sentence. The product backlog is all of it; the sprint backlog is this iteration's slice. | "nobody knows what's next" | `QUEUE`, held by the Queue role         |
| **Spike**                   | A time-boxed investigation to answer one question. The code is thrown away.                         | "we can't estimate this because we don't understand it" | K1 to K0, on purpose (section 5)       |
| **Stand-up / daily scrum**  | Five minutes, every day: done, next, blocked — and since when.                                      | "I didn't know you were stuck"                         | section 3 of the guidebook              |
| **Sprint review / demo**    | The client drives the real thing at the end of the iteration.                                       | "they will hate it in month six"                       | the demo rules                          |
| **Retrospective**           | The team, alone, after the demo: what did we learn the expensive way?                               | "we already learned this once"                         | `FINDINGS`                              |
| **Scrum**                   | A named framework: three accountabilities (product owner, scrum master, developers), five events (the sprint, planning, daily scrum, review, retrospective), three artifacts (product backlog, sprint backlog, increment). Everything in this table with capital letters. | the fears above, packaged | the four roles are the same shape, sized for four people |
| **Product owner**           | The one voice who orders the backlog and can say yes, no, and how much.                             | "the client is five people who disagree"               | the Client role, and one voice on their side |
| **Increment**               | The running thing at the end of an iteration. Usable, or it doesn't count.                          | "we have lots of parts and no product"                 | the thin vertical slice                 |
| **Minimum viable product**  | The smallest increment that answers the question "would anyone use this?"                            | "we built the whole thing before asking"               | iteration one of `parking/`             |
| **Velocity**                | Work completed per iteration, in whatever unit the team uses. A planning input, never a target — the moment it is graded, estimates inflate. | "we can't plan" | not tracked here, deliberately          |
| **Gamification**            | Progress shown as a score people want to move: tests turning red to green, grouped by story. Honest only while every green could have been red. | "we can't see progress" | tests named by requirement ID (`T-3`) |
| **Kanban / WIP limit**      | A board with a cap on how much is in progress at once. Finish before starting.                      | "everything is half done"                              | the Queue role's cursor                 |
| **Pair programming**        | Two people, one keyboard. Review while writing; K0 in two heads.                                    | "only one person understands this"                     | pair on the scary parts                 |
| **Refactoring**             | Changing structure without changing behavior, under tests that prove it.                            | "we can't touch this"                                  | serve, don't rule (`TESTING.md`)        |
| **Technical debt**          | Carry you took on knowingly, to be repaid. Unknowing carry is not debt; it is just cost.             | "we don't know what we owe"                            | `Deferred` in `DESIGN.md`               |
| **Continuous integration**  | Every push is built and tested on a machine that is not yours.                                      | "it works on my machine"                               | `CONTRIBUTING.md`'s three checks        |
| **Continuous delivery / deployment** | Every green build *could* ship (delivery); every green build *does* ship (deployment).      | "release is an event"                                  | `E-6` makes the second one a requirement |
| **Trunk-based development** | Everyone commits to one always-releasable branch, in small steps; long-lived branches are the enemy. | "the merge will take a week"                          | `main`, signed                          |
| **Feature flag**            | A switch that lets code ship dark and turn on later. Decouples deploy from release.                 | "deploying it means users see it"                      | the sensor's `MODE` is one              |

Two warnings about the vocabulary. First, none of it is the point; each term is a fear-retirement
with a name, and a team that performs the ceremonies without the fears will drop them under pressure
and be right to. Second, the terms are Goodhart bait — velocity most of all. When a measure becomes a
target it stops measuring.

---

## 9. What keeps humans and agents comfortable

The essay makes discomfort the leading indicator. The shape of the work is where you control it.

**Humans are comfortable when the next step is small, visible, and reversible.** Concretely:

- They know what *done* means before they start, because it is a sentence in the queue.
- They can see the fence — the demo is on the calendar, the deploy is routine — so the fear near a
  deadline has nothing to attach to.
- Decisions are two-way doors wherever possible, so being wrong costs an afternoon.
- There is slack in the plan, so K2 arriving is a planning event and not a crisis.
- They can watch tests turn from red to green in groups that mean a story is satisfied — the
  scoreboard in section 7. Progress that is visible, honest, and theirs is the cheapest comfort
  there is, and the client draws the same comfort from the same board.
- Bad news early is rewarded, visibly, every time, so it arrives early.
- Nobody is blamed for K2. The retro says *findable by X; X is now on the list*, and does not say
  who should have asked.
- The uncomfortable top-of-waterfall work is made concrete: a checklist of questions, a numbered
  document, a K4 to read aloud. Discomfort shrinks when the task has a shape.

**Agents do not feel anything, and the analogue is exact:** what keeps an agent *reliable* is the
same list, made literal, because an agent arrives every session knowing nothing and leaves
remembering nothing.

- It needs the working set in the repository — `REQUIREMENTS`, `DESIGN`, `QUEUE`, `FINDINGS` —
  because there is no hallway in which to be told the constraint.
- It needs a task small enough to review, with a test that defines done, because review capacity is
  the bottleneck and "this should work" is K3 by construction.
- It needs the contract before the code, because it will otherwise invent one, fluently, and every
  session will invent a different one.
- It needs the K4s written down, because a K4 held only in a head is a K2 to the agent and it will
  hand you a clean, tested violation.
- It needs one command to run and one to reset, because a machine that cannot run the thing cannot
  check its own claim.

And one asymmetry that decides where the human stands. The bottom three steps of the waterfall are
where an agent is fastest and most useful: designs, code, tests, fixtures, migrations, the second
and third test case. The top three are where it is no help at all, because they are conversations
with people, laws, and a client's sense of proportion. So the arrival of agents moves the human *up*
the waterfall. The requirement document is the railing that keeps a machine-speed descent from
becoming a machine-speed fall, and the "(test)" at each step is how the human stays in the loop
without reading every line.

---

## Checklists

**Before leaving Requirements for Design**

- [ ] Every requirement is numbered and observable, and the client has objected to at least one.
- [ ] `Scope decisions` and `Non-goals` exist and have been read aloud.
- [ ] The questions with a regulator attached have named answers: what data about people, who may
      see it, what rule applies, and who said so.
- [ ] The K4s have been read back as questions.
- [ ] Every "must" has, or is assigned, a test ID.

**Before leaving Design for Develop**

- [ ] Every one-way door is named, and each got the small-waterfall treatment: reviewed by someone
      who does not share the assumption, and done once.
- [ ] The contract between the pieces is written and checked in, so people can start the same day.
- [ ] Every mock misbehaves on request, and the mock and the real thing answer to one check.
- [ ] Nothing in the design changes a requirement. If it does, that is a conversation, not an edit.

**Before leaving Develop for Deploy**

- [ ] Every test has been seen red.
- [ ] The demo happened; every "huh" was written down and costed.
- [ ] The deploy is health-gated, the revert is automatic, and the rollback has been timed.

---

## The whole document as questions

| Ask                                                                        | And you are checking                                    |
| -------------------------------------------------------------------------- | ------------------------------------------------------- |
| "What does it cost to be wrong about this once?"                           | which regime this decision is in (4)                    |
| "What requirement has the client objected to so far?"                      | that you have not left the top of the waterfall early (5) |
| "Who, outside this room, does this keep a record about?"                   | the door with a regulator attached (5)                  |
| "Could another team satisfy this sentence a different way?"                | requirement or design (6)                               |
| "What does the test have to observe to assert this?"                       | the API, derived rather than invented (7)               |
| "Which fear does this ceremony retire?"                                    | that the practice is real (8)                           |
| "What would I know when this spike stops?"                                 | a descent on purpose, or a fall (5)                     |
| "What does the agent have to read to get this right the first time?"       | that the railing exists (9)                             |

---

## Where this shows up in `parking/`

| Idea                                | Where it is made concrete                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| The top of the waterfall, on purpose | `REQUIREMENTS.md` and `DESIGN.md` written before seven of ten components               |
| The small waterfall around a one-way door | `V-7`, `V-4`, `I-2`, and `E-8`'s timed rollback                                  |
| The privacy requirement nobody would derive | "Counts, not locations" in `Scope decisions`                                    |
| Requirement vs. design              | the two documents and their two change triggers; `CONTRIBUTING.md`'s costume rule      |
| Story to test to API                | `U-1`–`U-3` → `T-2` → `age_ms`, `C-4`, `POST /control/mode`                             |
| The fence that ends an iteration    | `parkctl conform` exiting nonzero; the demo                                             |
| The railing for agents              | `AGENTS.md`, and the working set                                                        |

---

## Reading

- **Winston Royce, "Managing the Development of Large Software Systems" (1970)** — the waterfall
  diagram, and on the next pages the argument against it. Read past the figure.
- **Barry Boehm, "A Spiral Model of Software Development and Enhancement" (1988)** — the
  risk-driven ancestor of every loop in section 3: do the riskiest thing first, in the smallest
  increment that retires the risk.
- **The Agile Manifesto (2001)** — four values and twelve principles on one page; shorter than most
  summaries of it.
- **Ken Schwaber and Jeff Sutherland, *The Scrum Guide*** — the framework in section 8, defined by
  its authors in about thirteen pages. Read it before reading anyone's opinion of it.
- **Kent Beck, *Extreme Programming Explained*** — spikes, the planning game, the on-site customer,
  and the argument that practices reinforce each other and fail alone.
- **Mike Cohn, *User Stories Applied*** — the story-to-acceptance-test chain in section 7, at book
  length.
- **Craig Larman and Victor Basili, "Iterative and Incremental Development: A Brief History"
  (2003)** — evidence that the loop predates the word *agile* by forty years, including in projects
  that could not afford to be wrong.
