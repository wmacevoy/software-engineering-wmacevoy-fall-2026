# Team and Client

A guidebook. Who builds the thing, who it is for, and what has to pass between them — with
`parking/` as the running example, including the iteration where the client mentions the VIP spaces.

| Document                       | Answers                                                     |
| ------------------------------ | ----------------------------------------------------------- |
| `../SOFTWARE-ENGINEERING.md`   | what you don't know, and what you're afraid of              |
| `../SOFTWARE-ENGINEERING-2.md` | what you're working in, and where the problem comes from    |
| `docs/TEAM-AND-CLIENT.md`      | who is building it, who it is for, and what passes between them |
| `../AGENTS.md`                 | how agents work here                                        |
| `../CONTRIBUTING.md`           | how a change is accepted                                    |

The two essays treat the people in six bullets: they are part of the system, coordination cost
grows, write things down. True, and not enough. **The team is a first-order variable.** The result
depends on it directly — not through the technology, not as a mood on top of the technology — and
unlike the technology it gets chosen by default unless somebody chooses it on purpose. This is the
on-purpose version.

It is a guidebook, so where the essays argue, this one says what to ask, what to write down, and what
to do on Thursday. Everything is anchored in one hypothetical: a team of four, one term, and a stadium
operations manager who wants "an app that shows which lots have spaces." What they build is
`parking/`. What they miss is in section 7, and it is the reason this document exists.

Nothing here is checkable by continuous integration. Same reason as always for writing it down.

## Terms used here

| Term            | Meaning                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| **K0**          | You know it, and it's true.                                                       |
| **K1**          | You know you don't know it. Cheap — go find out.                                  |
| **K2**          | You didn't know you didn't know. Only reality tells you, and it charges by the week. |
| **K3**          | You're certain, and you're wrong. Triggers no search, so it is found last.        |
| **K4**          | A useful falsehood kept on purpose, with a note on where it is load-bearing.     |
| **Working set** | `REQUIREMENTS_vX`, `DESIGN_vX`, `QUEUE`, `FINDINGS` — in the repository, versioned with the code. |
| **Iteration**   | A fixed period, one to two weeks, that ends in a running thing shown to the client. |
| **Fence**       | A checkpoint that proves something: a demo, a conformance run that exits nonzero, a deploy. A meeting is not a fence. |
| **Client**      | The person who can say yes, no, and how much. If nobody can, you do not have a client yet. |

---

## 1. The team is a first-order variable

Four reasons, each with a consequence you can act on.

**The system will resemble the team.** Conway observed it in 1968: a system's structure copies the
communication structure of the organization that built it, because an interface between two
components can only be as well-specified as the conversation between the two people who own them.
So the component table in `parking/README.md` is also a team structure. A README per component,
stating its contract, is what two people agree on so that they can stop talking. If the team does
not choose its shape, the system inherits whatever shape happened — usually "who sat together."

**Knowledge lives in heads, and heads leave.** Everything that is K0 to exactly one person is K0 with
no backup. A teammate takes a job, gets sick, drops the course, and the deletion is uncontrolled.
`parking/` is *about* not having single points of failure — one key, one chain, one clock — and the
team building it has one in whoever understands the signing string.

**The team's fear sets its practice.** `SOFTWARE-ENGINEERING.md` describes the avoidance gradient:
fear rises near the deadline and destroys exactly the practices that would have made the deadline
survivable. That makes team discomfort an engineering input with a leading-indicator property. It
shows up weeks before the schedule does, and somebody going quiet in stand-up is data.

**Coordination cost grows faster than headcount.** Four people are six pairs; six people are fifteen.
Every pair needs an interface, and the interfaces nobody wrote down get negotiated in meetings. That
is the whole mechanism behind "adding people to a late project makes it later," and it is why the
fix is always a smaller, written interface rather than another meeting.

The consequence of all four: **the team's shape is a design decision with the same status as the
schema.** It is made early, it is hard to change, and everything built afterward assumes it. Make it
on purpose, write it down, and version it when it changes.

### A team fails the way an input fails

The essays say every input a component depends on needs a stated answer for four cases: absent,
late, wrong, and lying. A teammate is an input. A plan that only works when everyone is present, on
time, right, and candid is the team version of *a system that only works when its inputs behave* —
not finished.

| Case   | On a sensor                        | On a team                                                    | What handles it                                                                 |
| ------ | ---------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Absent | `down`                             | gone for a week: illness, an interview, another course's deadline | nothing K0 in only one head — pair on the scary parts, review everything, the working set in the repo |
| Late   | `slow`                             | "almost done" for three weeks                                 | steps small enough that late is visible in days; a fence that says done or not — it runs or it doesn't |
| Wrong  | `wrong`                            | a confident K3 in the design                                  | review by someone who does not share the assumption; demonstrate before you defend (`F-6`, applied to people) |
| Lying  | `stuck` — 200 OK, frozen `as_of`   | status that reads green because red is uncomfortable          | status is a demo, not a sentence; reward bad news early, visibly, every time    |

Nobody on your team sets out to lie. "It's basically done" is the human `stuck` fault: a successful
response with nothing behind it changed. The defense is the same as for the sensor. Do not trust the
status field; check the age of the last thing that actually ran.

### The question you can ask

> "If one of us vanished on Friday, what could the rest of us not do on Monday?"

If the answer is anything at all, that is the next thing to pair on.

---

## 2. Roles that retire a fear

A team of three to five needs no titles and four roles. Each retires a specific fear, and by the rule
in `SOFTWARE-ENGINEERING.md` a role that retires none should be dropped. Everyone writes code. The
roles rotate every iteration, so that knowledge spreads and nobody becomes the single point of
failure they were just told to avoid.

| Role       | Holds                                                    | Fear it retires                                                        |
| ---------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Shape**  | the glossary, `DESIGN`, and the right to say no          | "four good local designs and one incoherent system"                    |
| **Client** | `REQUIREMENTS`, the demo, one voice to the client        | "we each heard something different" — "the client was surprised"       |
| **Queue**  | `QUEUE`, what *done* means, the plan for this iteration  | "two people did the same task" — "nobody knows what state we are in"   |
| **Fence**  | tests, CI, the one-command reset, `docker compose`       | "works on my machine" — "we cannot tell whether it is broken"          |

- **Shape** is Brooks's surgeon, scaled down: one person holds the whole design in their head, and
  most of the job is saying no, especially to good ideas. Vocabulary is the front line — the
  appearance of a new noun is an event that needs a decision, and Shape makes it.
- **Client** is one voice each way. Ask the client to name the one person on their side who can
  decide. Everything the client says goes through this role into `REQUIREMENTS`, or it did not
  happen.
- **Queue** keeps the cursor. Nothing enters the queue without a sentence saying what would make it
  done, and *done* means the list in `CONTRIBUTING.md` — not most of it.
- **Fence** owns the cost of a test. The essays say that cost is designed, not given; this is the
  person who designs it. When something is hard to test, that is information about the design, and
  Fence takes it to Shape.

Rotation costs a hand-off each iteration. The hand-off is where you discover which K0 was living in
a head. That is not the cost of rotation; it is the point of it.

---

## 3. The interface between two people is a contract

`SOFTWARE-ENGINEERING-2.md` makes the argument — the interface between two developers is the same
object as the interface between two modules. This is the procedure.

**Before splitting work, write the contract between the pieces and check it in.** Then both people
start on the same day.

1. **Name the seam.** "I'll build the collector, you build the journal" names two components and no
   seam. The seam is the append call: its shape, its errors, what happens when the journal is down.
2. **Write the shape.** Signature, schema, error codes. `contract/README.md` says why it exists —
   *so that two people can build the sensor and the collector without talking to each other* — and
   it is layer 0 for the same reason. An hour, done properly.
3. **Write the mock that misbehaves on request.** A journal that accepts, a journal that refuses, a
   journal that hangs. The other person's component now has something to be built against.
4. **Write the test that fails today** and passes when the real thing arrives.
5. **Integrate every day.** A mock is a K4 — *the real thing will behave like this* — and daily
   integration is how you find out when it came due. Mock everything, integrate at the end, and every
   person delivers on time into a system that does not work.

**Meetings are the tax on unwritten interfaces.** If the same meeting keeps happening on the same
topic, an interface is missing. Write it, and the meeting stops.

The minimal set that survives that rule:

| Meeting      | When                                        | Shape                                                        | Retires                            |
| ------------ | ------------------------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| Stand-up     | every class day, five minutes                | per person: done / next / blocked — and *since when*          | "I didn't know you were stuck"     |
| Demo         | end of iteration                            | the client drives the real system                             | "we built the wrong thing"         |
| Planning     | right after the demo, reactions in hand     | the next queue, priced, with the client                       | "we don't agree on what's next"    |
| Retro        | after planning, team only                   | what did we learn the expensive way — goes into `FINDINGS`   | "we already learned this once"     |

*Since when* is the load-bearing field. A blocker's age is its `age_ms`. A three-day-old blocker is
stale, and it should be presented as stale rather than as current, for exactly the reason `U-2`
gives.

---

## 4. The client

### What they know, and what they cannot tell you

| They know                                         | They cannot tell you                                              |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| the domain, better than you ever will             | what should happen in a case they have never had to think about   |
| the pain: who calls, what it costs, who gets blamed | how big a requirement is in *your* world                          |
| the money, the politics, who else has a say       | what they will want once they see it running                      |
| the solution they have already imagined           | that it is a guess                                                 |

The right-hand column is not a deficiency. It is the shape of expertise: the client knows the
domain so well that its edges are invisible to them, the way accidental complexity you built is
invisible to you.

### The proportion mismatch

The client measures a requirement by its size in their world: spaces, dollars, headcount, minutes.
The design measures it by how many assumptions it invalidates. **These two sizes have nothing to do
with each other.** A requirement covering one space in five hundred can be most of a redesign. A
requirement that sounds enormous — "also show the lots on a map" — can be a line in `Non-goals`
that costs nothing at all.

Neither party is wrong. The gap between the two senses of proportion is where K2 lives, and closing
it is the team's job, not the client's — because only the team knows what the assumptions are.

### Read your K4s to the client

This is the mechanism, and it is the cheapest question in this document.

Every scope decision and every K4 in `REQUIREMENTS` is a sentence the team believes and the client
has never been asked about. Read them back as questions:

- "We're assuming every space is the same. True?"
- "We're assuming nobody has a claim on a space before their car is in it. True?"
- "We're assuming a driver never tells the system anything — they only look. True?"
- "We're assuming a lot is either open or closed, and nothing in between. True?"
- "We're assuming the count is the only number a driver needs. True?"

Each one converts a K4 — or a K3 you did not know you were holding — into K1 for the price of one
sentence. Do it in week one, and again every time the scope decisions change. The client will answer
most of them in two seconds, and one of them will make them stop and say "well, except…"

### What passes between you

| The client owes the team                             | The team owes the client                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| decisions, on a date                                 | no surprises — bad news within a day of knowing it                 |
| numbers, with a horizon (`E`)                        | priced options, with scope as the honest variable to move          |
| access: the site, the real users, the clipboard      | a running thing to react to, every iteration                       |
| one voice that can decide                            | the list of what you are *not* building, read aloud                |
| answers to "what happens today?"                     | a version, not an edit, when they change their mind                |

### The client who…

| Situation             | Move                                                                                                                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| doesn't show up       | Nominate a stand-in inside the team. Write invented numbers, *marked invented*. Demo to the empty chair on schedule anyway — the artifacts stay wrong-able. Say so in the status. |
| changes their mind    | `REQUIREMENTS_v(n+1)`. Never edit `v(n)`. The diff is the most useful thing you will ever show them.                  |
| wants everything      | Price it. "Yes, and here is what it moves." Every sentence in a requirements document is a purchase.                   |
| is your instructor    | Still ask "what happens today?" An instructor has a pain too, and it is usually "I can't tell what state this project is in." |
| is you                | The worst case: every guess confirmed by the only person who could dispute it. Nominate an actual human, and go get corrected on a schedule. |
| is surprised          | You failed, not them. Find the delay between knowing and telling. That delay is the bug.                              |

---

## 5. The first conversation

Ninety minutes, in week one, at the site if there is one. Order matters: **pain before solution,
people before features, numbers before nouns.**

- [ ] What happens today when it goes wrong? Who gets the call? What do they say?
- [ ] **Who are all the kinds of people this touches? Is any of them treated differently?**
- [ ] Walk me through a bad day from your side. Show me the clipboard, the radio, the spreadsheet.
- [ ] How many? And in two years? (`E-1` through `E-4`)
- [ ] How long may it be down, and when? (`E-6`)
- [ ] What are we explicitly *not* building?
- [ ] Who is affected who is not in this room?
- [ ] What would you do differently with this answer?
- [ ] Read the K4s back.

The second item is the one teams skip, and section 7 is what it costs. It is not a features
question. It is a *taxonomy* question — a census of everyone the system touches — and its answers
arrive as nouns you have never heard: *season-ticket holders, the VIP gate, the tow contractor,
the ADA row.* Each noun is a candidate for the glossary and a candidate for a requirement, and the
client will not volunteer any of them, because in their world those are not "the app."

**Output, within forty-eight hours:** `REQUIREMENTS_v1`. Numbered, observable, with the numbers in —
invented ones marked invented. A `Scope decisions` list and a `Non-goals` list. A glossary at the
top, ten to thirty nouns, one line each. A `Not yet answered` section. Sent to the client with one
sentence attached: *tell us what is wrong with it.*

Specific and wrong beats vague and safe. The first draft's job is to be wrong in a way that is cheap
to correct, and the only way it can do that job is by making claims precise enough to be rejected.

**In `parking/`.** The `E` section is arithmetic done on the client's answers, not a transcript of
them. "Counts, not locations" is a scope decision with an ethical reason attached. "The gate staff
radio each other and guess" is the answer to *what happens today*, and it is why the requirements
are about trust in a number rather than about a map. What is not there is a glossary — and section 7
is where its absence is felt.

---

## 6. The iteration

One to two weeks. Ends at a fence. Produces four things, and an iteration that produces three is not
done:

1. **A running thing** the client can touch, from a clean reset, on data shaped like theirs.
2. **A diff to `REQUIREMENTS`** — `v(n)` to `v(n+1)` — if anything changed, including `Non-goals`.
3. **A `FINDINGS` entry:** what was learned at full price this iteration.
4. **A `QUEUE`** that says what is next, priced, with a *done* sentence on each item.

**Thin vertical slice first, then thicken.** `parking/` iteration one: one lot, one sensor with its
fault switchboard, the collector polling it, the driver page showing live, stale, and unknown.
Signed readings, because the signing string is layer 0 and the bridge should carry the load-bearing
idea from the start. Not: eight languages, firmware, the log chain. Enough to set a sensor `stuck`
in front of the client and watch what they say.

### Demo rules

1. **The real system**, from `T-5`'s one-command reset. Not slides, not a video, not a branch.
2. **The client drives.** Watch their hands and their face, not the screen.
3. **Write down every "huh," "oh," "can it…," and "what about…" verbatim.** Do not answer in the
   room. Those are K2 signals, and they are costed afterward, against the assumptions, not against
   the code. Section 7 is one of them.
4. **Break something in front of them.** Set a sensor `stuck`. Their reaction to the stale display
   is a requirement, and it is one they could not have stated in advance.
5. **Read `Non-goals` aloud.** Every demo. It is the cheapest way to find out that a non-goal is not
   one.
6. **Thirty minutes.** Attention is the scarce resource on their side too.

### Status between demos

Weekly, three lines, the same shape every time: done, next, risk-and-since-when. The uniformity is
deliberate — when every status has the same shape, the one that deviates is a signal. Bad news goes
out within a day of being known, with a number and an option attached, and never waits for the
weekly.

---

## 7. The pivot: "It does the VIP spaces too, right?"

End of iteration one, four weeks in. The demo went well. The operations manager set a sensor `stuck`
themselves, watched the count go grey with its age beside it, and said "yes — that." Walking to the
door:

> "This does the VIP spaces too, right? Season-ticket people book a space from their phone on the
> way in, it's held for thirty minutes, then it opens back up. It's only about two hundred spaces."

Two hundred in a hundred thousand: one space in five hundred. To the client, a rounding error — and
reasonably so. In their world VIP is small, handled today by gate staff with a printed list and a
row of cones, and self-evidently not what "an app that shows which lots have spaces" was about.

The team's first instinct is the client's proportion: *sure, a flag on the lot and a small table.*
Here is what the sentence actually does to a design that was not expecting it.

### What one sentence invalidates

| The team believed                                          | Where it is written                                   | What the VIP sentence does to it                                                                                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A lot is a count. `available = capacity − occupancy`.      | `lotSelectFields` in `app/index.js`; `S-1`; `U-1`     | A held space is free to the sensor and not to the driver. Availability now has three inputs, and one of them expires on a clock.                                        |
| Counts, not locations.                                     | `Scope decisions`; the ethics paragraph in `SOFTWARE-ENGINEERING.md` | A hold is (person, place, time): the first location record about a named person. Retention (`A-5`) acquires a legal dimension it did not have.              |
| One sensor per lot, not per zone.                          | `Scope decisions`; `E-1`                              | VIP is rows inside a lot. The sensor cannot see the boundary. Either per-zone sensing, which was refused in writing, or a new noun and a stated falsehood about where VIP occupancy comes from. |
| Drivers are anonymous readers.                             | `A` (no driver row); `E-3`; `U`                       | The first write from the driver side. Needs a driver identity — a fifth for `I-1` — and turns a hundred thousand anonymous readers into some number of authenticated writers. |
| The sensor is the only source, and the designated liar.    | the `Shape` diagram; `F`                              | A second source: whoever says who is a VIP. Absent, late, wrong, lying — four cases nobody has faulted, for a list nobody on the team has seen.                          |
| Readings are idempotent: "set available to 37."            | `S-1`; the retired push endpoint; `SOFTWARE-ENGINEERING-2.md` §2 | "Hold one space" is "one car arrived" — not idempotent. A retry double-books. Needs an idempotency key and a race decided inside the database: the first write contention in the system. |
| Time is for detecting skew.                                | `N`; `time/`                                          | Thirty minutes is a promise to a person, kept by a clock. Expiry is customer-visible. `E-10`'s repeated hour now lands on a driver at 01:50 one night in November. Tests need an injectable clock inside `app`, which `time/` was never scoped to provide. |
| A read rides out a gap.                                    | `E-6`, `E-7`, `E-8`                                   | A write cannot serve stale. What is the availability budget for *making* a hold, and who is its beneficiary? At 02:30 during a migration, can anyone hold a space? Maintenance becomes customer-visible. |
| `available` means one thing to every consumer.             | `V-4`; the browser API                                | If the driver's number now excludes held spaces, the meaning of an existing value changed — breaking under `V-4`. A new version, or a new field with a new name.        |
| The peak is arrival.                                       | `E-2`                                                 | A new peak: the instant holds open. Two hundred spaces, a few thousand pass holders, one moment. A herd on a tiny resource is a different shape from 1.7 a second into a big lot. |
| The log carries no personal data.                          | `L-6`, `L-7`                                          | The audit stream now records who held what, and when. Data minimization was free; now it is a design.                                                                   |
| Reservations are a non-goal.                               | `Non-goals`                                           | The one line that was written down. `grep -i reservation` finds the collision in a second. Unwritten, it is found in code review in week nine.                            |

Ten of the twelve lettered sections of the requirements, both scope lists, and the glossary that
does not exist yet. For one space in five hundred.

That last row is worth pausing on. `Non-goals` did its job: it made the collision findable by grep
instead of by accident. It could not prevent the collision — no document can — but it turned "we
never thought about that" into "we thought about it, decided against it, and here is where we wrote
that down," which is a different conversation to have with a client.

### The first casualty is a word

`available`. To the sensor it means *physically free*. To a driver it now means *free and not
held*. One word, two things — the silent error `SOFTWARE-ENGINEERING-2.md` §4 warns about, and the
kind the types will not catch. Before any code moves, Shape settles the vocabulary:

- `available` keeps its meaning. `S-1` is untouched; the sensor never learns that VIP exists.
- **zone** — a part of a lot with a class and a capacity. Today every lot has one zone. VIP lots
  have two.
- **hold** — a claim on one space in a zone, by a holder, for a bounded time. It is either
  `held`, `arrived`, `expired`, or `released`.
- **holder** — the person a hold belongs to. The fifth identity in `I-1`.

Three new nouns and one protected old one. That is the whole pivot at the level where it is cheap.

### Why this is K2, and why it was late

It was findable in week one, at K1 price, by any of three questions already on the intake list:

| The question                                                              | What it would have surfaced                                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| "Who are all the kinds of people this touches? Any treated differently?"  | "Season-ticket holders. They get the VIP rows."                        |
| "Walk me through a bad day from your side. Show me the clipboard."        | A printed list and a row of cones at the gate.                          |
| "We're assuming nobody has a claim on a space before their car is in it. True?" | "Well — except VIP."                                              |

The client knew. They did not think it was yours. **The client's sense of proportion filtered it
out, and the team's sense of proportion should have overridden the filter — and could not, because
nobody asked.** That is the asymmetry that makes it the team's job: only the team knows which
assumptions the design is standing on.

There is a second K2 hiding behind the first, and the site walk — done now, four weeks late — finds
it in ten minutes. "The VIP lot" is not a lot. It is the front two rows of four different lots, near
four different entrances. The client's sentence was wrong the way every first sentence is wrong, and
the walk that would have corrected it in week one is the same walk that would have found VIP in the
first place. One skipped hour, two surprises.

### What "late" costs

The code is the cheap part on every row of this table. What the K-ladder measures is *order*: the
same system, built in a different sequence, with a K3 removed by hand from four heads.

| Found in        | The bill                                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **week one**    | Three nouns in the glossary. `available` derived from three inputs from the start. The holder is the fifth identity in `I-1`, with a row in `A`. An injectable clock in `time/`'s brief. A write budget in `E`. `Non-goals` says "payment, enforcement," not "reservations." About a day, most of it conversation. |
| **week four** (here) | All of the above, plus: reopen three scope decisions that were recorded *so they would not be relitigated*; renegotiate `E-6` for writes; a schema change with data under it — little data, but the habit of `down -v` is now a habit of losing something; and unlearn "a lot is a count," which every member of the team now holds as K0. Two weeks, and the iteration-two plan is gone. |
| **week ten**    | Plus a version served alongside the old one under `V-4`, because browsers and a sensor fleet are on the API; plus a migration that has to fit inside `E-8`'s hour, with the rollback timed first.                                             |
| **after launch**| Plus the outage, in the window, on a night that is not a transition night, with the client watching.                                                                                                                                         |

The step from week one to week four is not the biggest step in code. It is the biggest step in
*belief* — the point where a K4 that could have been chosen became a K3 that has to be excavated —
and belief is the thing that does not show up in a diff.

### The trap: "it's just a flag"

Someone on the team — or an agent, in five minutes — will propose the obvious diff: an `is_vip`
column on `lots`, a `reservations` table, and a subtraction in the shared SQL fragment. It runs.
The tests pass. Nothing collapses, because nothing in software has mass.

The bill it hides:

- `available` now silently means two things, and every consumer downstream inherits the ambiguity.
- A retry double-books, under a load nobody has generated yet.
- The 02:00 migration blocks every hold, and nobody has said whether that is allowed.
- The membership list's failure modes are whatever the HTTP library does on timeout — chosen by
  nobody.
- The November repeated hour expires holds early, or late, depending on a string comparison.

The flag is the K3, arriving at machine speed. The costing table above is the human's job, and it
comes *before* the diff, not after.

### What the team does

1. **Name it in the room, without saying yes or no.** "That's a new kind of thing — a claim on a
   space before a car is in it. Nothing we've built has one of those. Give us until Thursday to
   cost it." Not "out of scope." Not "sure." Both are answers to a question that has not been
   understood yet.
2. **Cost it against the assumptions, not against the code.** The table above. One hour, whole
   team, Shape leads. The unit of cost is *invalidated assumptions*, and that is the number the
   client cannot compute and needs.
3. **Bring priced options, with scope as the variable that moves.**

   | Option | What it is                                                                                                   | What it costs                    | What it forecloses                                                       |
   | ------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------ |
   | **A**  | Counts only. A VIP zone shows its own count. The gate person keeps doing the holding, with the list and the cones. | Days. K4: *the gate is the truth about VIP.* | Nothing. The zone noun is in, and holds can be added later.        |
   | **B**  | Holds with expiry, holder identity, arrival confirmed at the gate. No payment, no enforcement.               | Two iterations.                  | The iteration-two plan (the log chain, firmware).                        |
   | **C**  | Full reservations: payment, enforcement, cancellation, notifications.                                        | The term.                        | Payment is a one-way door with a regulator attached. Not this project.   |

   Recommend one, with the reason. Here: **B if the term allows two more iterations after it, A if
   it does not** — and A is not a loss, because A introduces the zone noun and the K4, which is
   most of what B needs and all of what B needs first.
4. **Version the requirements.** `REQUIREMENTS_v2`. `v1` is not edited; the diff is the
   conversation. `Non-goals` changes with a reason on the line.
5. **Record the finding.** `FINDINGS`: *VIP holds found at the week-four demo. Findable in week one
   by the taxonomy question or the site walk. Both are now on the intake list.* One paragraph, so the
   next team — or the next agent, which remembers nothing — does not pay for it again.
6. **Fix the process, not the person.** The intake checklist in section 5 has the taxonomy question
   in bold. You are reading the fixed version.
7. **Re-plan with slack, and do not add a person.** A cross-cutting change belongs to Shape plus
   one other, not to "the team." Four people touching twelve sections at once is fifteen pairs'
   worth of coordination on a change whose whole difficulty is coherence.
8. **Ask what became deletable.** Usually nothing. Ask anyway; it is the return nobody schedules.

### What iteration two looks like

Enough of a sketch to see that the restructure is real and that none of it is difficult. All of it
is simply *somewhere other than where the code was.*

```
vip_empty     = vip.capacity − arrived           # from the gate's confirmations, not the sensor
vip_takeable  = vip_empty − held(now)            # what a holder may take; held() expires on a clock
general_free  = available − vip_empty            # two sources, two clocks; negative is a fault (C-5)
```

- **The K4, stated.** *The gate's confirmation is the truth about VIP occupancy.* The sensor still
  counts the whole lot; the VIP rows are subtracted from a source that is a person. That person is a
  caller identity, enrolled like ops, and — because this system takes its own advice — the
  designated liar for VIP is now the gate, and `F` gets a mode for it.
- **The hold has a lifecycle and an owner.** `held → arrived | expired | released`. Expiry is
  computed from a clock that `app` can be handed in a test (`T-1` for time), never from a formatted
  local string (`E-10`).
- **The write is idempotent by key.** A hold request carries a client-generated key; the same key
  twice is the same hold once. The last space is decided by the database, in one statement, not by
  whichever request the load balancer saw first.
- **A fourth case for the driver** (`U-1` becomes four): live, stale, unknown, and *held for you,
  expires in twelve minutes.*
- **A write budget in `E`,** with its own beneficiary, and a stated answer for holds during the
  maintenance window.
- **A retention line for holds** (`A-5` gains a second policy), because a hold is personal data and
  the safest record is still the one you never kept.

Notice the shape of the list. The sensor did not change. The collector did not change. The signing
string did not change. Everything that moved is vocabulary, derivation, identity, time, and policy —
the parts that were decided in week one by not deciding them.

### Team dynamics of the pivot

- **It is nobody's component, so it is Shape's.** A change that cuts across every README belongs to
  the role that holds the whole, or it gets four local solutions and a merge conflict about what
  `available` means.
- **The temptation is to add a person.** Resist it for the reason in section 1. The work is
  coherence, and coherence does not parallelize.
- **There is no blame to assign, and it is worth saying so out loud.** The `FINDINGS` entry says
  *findable by X; X is now on the list.* It does not say who should have asked.
- **The client will feel they should have mentioned it.** Say: "You did mention it. We didn't ask."
  Then move to the options. A client who feels blamed for a K2 stops volunteering the next one, and
  the next one is the expensive one.

---

## 8. Disagreement, bad news, and being behind

### Disagreement

Four moves, in order. Most arguments end at the first.

1. **Is it a category dispute?** Ask *what requirement would have to disappear for this complexity
   to go away.* One person is arguing taste and the other is arguing the problem; the question
   tells you which, and it converts a dispute with no end into a question with an answer.
2. **Set the intensity by reversibility.** A one-way door — a schema with data under it, a
   published interface, a distributed key — gets the whole team and a written decision. Everything
   else gets decided by whoever holds the relevant role, with the reason written down and a revisit
   date named. Most arguments in software are conducted at the wrong intensity for their
   reversibility.
3. **If it is still split and cheap to test, spike both.** One afternoon each, against the same
   test. That moves the question to K0 for the price of an afternoon instead of arguing it as two
   competing K3s for a week.
4. **Disagree in the conversation, not in the commit.** Once decided, the decision goes into
   `Scope decisions` with its reason, and reopening it requires new information — not a new mood.

### Bad news

**The delay, not the slip, is the cost.** A two-week slip found in week two is a planning problem;
the same slip found in week eleven is a crisis; the difference is entirely the reporting delay. So
the rule is mechanical: within a day of knowing, to the person it affects, with a number and an
option.

> "We're a week behind on the collector. We can drop the log chain from this iteration or slip the
> demo a week. We recommend dropping the chain."

Bad news with an option attached is planning. Bad news without one is a confession, and it makes
the receiver do the planning under worse conditions than you had.

The same rule applies inside the team. The person who says "I'm stuck" on day one has cost the team
a day. The person who says it on day five has cost five, plus the four days everyone else built on
the assumption that the thing was coming.

### Being behind

A person who is behind is a queue near full utilization, and queues do not degrade gracefully near
full — latency goes to infinity. Three things follow:

- **Do not add work to the person with the most K0.** That is the instinct, and it is the bus factor
  getting worse in real time.
- **Redistribute, pair, or cut scope.** In that order, and say which in stand-up, with the *since
  when*.
- **It is a systems failure with a schedule, not a character flaw.** Treat it as the second and you
  guarantee the first happens again, silently, because nobody will report it early.

The most dangerous team member is the one carrying the project. Rotate the roles anyway. Pair them
with the person who knows least. The point of the term is four people who can each explain the
whole thing, and a hero produces the opposite.

---

## 9. Agents on the team

An agent is a teammate with no memory and no stake. It arrives every morning knowing nothing that
is not in the repository, and leaves every evening remembering nothing it learned. Everything in
section 3 about written interfaces therefore applies twice: an agent cannot be caught in the
hallway, and the constraint that lives only in a head is one the agent will violate cleanly, with
tests, before lunch.

- **The client never talks to the agent.** The Client role does, and what the client said reaches
  the agent only through `REQUIREMENTS`. Anything left in a chat log or a notebook does not exist as
  far as the agent is concerned — and, by the rule in section 2, did not happen.
- **The pivot, with an agent.** Ask for the VIP feature and you will get the flag in five minutes:
  clean, tested, plausible, and carrying every line of the hidden bill in section 7. The costing
  table is the human's job and it happens before the prompt. What the agent *is* good for is the
  grep-shaped half of that job — *"which assumptions in `REQUIREMENTS` does this sentence
  invalidate?"* — because that is search, and search is what it is for. Then people decide.
- **Ask it the retro questions.** *What did you assume because nobody wrote it down? What did you
  have to read that you should not have needed?* Put the answers in the repository. That is how an
  agent joins the team: not by remembering, but by the team writing down what it would have needed
  to remember.
- **Working code nobody can explain is a liability**, and an agent produces it faster than a team
  can review it. The four roles do not change. Fence still owns the cost of a test; Shape still says
  no; and the signature on the commit is still a person saying *I have read this and I stand behind
  it.*

---

## Checklists

**Before splitting work**

- [ ] The seam is named.
- [ ] Its shape is written: schema, signature, error codes, what happens when it is absent, late,
      wrong, or lying.
- [ ] A mock exists that misbehaves on request.
- [ ] A test exists that fails today.
- [ ] Both people can start tomorrow without talking.

**Every iteration**

- [ ] A running thing, from a clean reset.
- [ ] `REQUIREMENTS` diffed, if anything changed, including `Non-goals`.
- [ ] A `FINDINGS` entry.
- [ ] A priced `QUEUE` with a *done* sentence per item.
- [ ] Roles rotated; the hand-off surfaced what was in a head.
- [ ] Something deleted, or a sentence about why nothing was.

**Every demo**

- [ ] Real system, client drives, thirty minutes.
- [ ] Every "huh" written down verbatim, none answered in the room.
- [ ] A fault set in front of them.
- [ ] `Non-goals` read aloud.
- [ ] The K4s read back as questions.

**When K2 arrives**

- [ ] Named in the room; no yes, no no.
- [ ] Costed against assumptions, not code — a table, with the whole team.
- [ ] Priced options with a recommendation, within the week.
- [ ] `REQUIREMENTS` versioned, not edited.
- [ ] `FINDINGS` entry naming the question that would have found it.
- [ ] That question added to the intake list.
- [ ] Re-planned with slack; nobody added.

---

## The whole document as questions

| Ask                                                                    | And you are checking                                  |
| ---------------------------------------------------------------------- | ----------------------------------------------------- |
| "If one of us vanished on Friday, what couldn't we do on Monday?"       | that no K0 lives in one head (1)                      |
| "Which fear does this role retire?"                                     | that the role is real (2)                             |
| "What meeting keeps happening on the same topic?"                       | which interface is missing (3)                        |
| "We're assuming X. True?"                                               | that your K4s are the client's K0, not their K2 (4)   |
| "Who are all the kinds of people this touches?"                         | that you have the taxonomy, not the client's guess (5) |
| "What did we learn at full price this iteration?"                       | that `FINDINGS` is being written (6)                  |
| "What does this sentence invalidate?"                                   | the size of a change in your world, not theirs (7)    |
| "What requirement would have to disappear for this argument to end?"    | category, not taste (8)                               |
| "How many days between knowing and telling?"                            | the actual cost of the bad news (8)                   |
| "What did you assume because nobody wrote it down?"                     | what the agent — and the next teammate — needed (9)   |

---

## Where this shows up in `parking/`

| Idea                                     | Where it is made concrete                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The team's shape is the system's shape   | the component table in `README.md`; one README per component stating its contract                 |
| The contract before the split            | `contract/` at layer 0, built first, seven consumers still unbuilt                                 |
| Arithmetic on the client's answers       | `E` — the fill rate, the staleness threshold, the named window                                     |
| What was decided against, and why        | `Scope decisions`; `Non-goals`; `DESIGN.md`'s `Deferred`                                          |
| The honest state of not knowing          | `Not yet answered` under `E`                                                                       |
| A status field you should not trust      | `S-4`, `F-2` — and the human `stuck` fault in section 1                                            |
| Where the pivot would land               | `lotSelectFields`; the `Non-goals` line on reservations; the glossary that `REQUIREMENTS.md` does not yet have |

---

## Reading

One line each on what the source actually says, so you can pick one rather than all.

- **Melvin Conway, "How Do Committees Invent?" (1968)** — four pages. The system copies the
  communication structure; therefore choose the structure.
- **Fred Brooks, *The Mythical Man-Month*** — chapter 3, "The Surgical Team," is section 2 of this
  document; chapter 7, "Why Did the Tower of Babel Fail?", is section 3.
- **Tom DeMarco and Timothy Lister, *Peopleware*** — the team as the unit of production, and what
  fear and interruption do to it. The evidence behind section 1.
- **Donald Gause and Gerald Weinberg, *Exploring Requirements*** — the intake conversation as a
  method. The taxonomy question is theirs.
- **Donald Gause and Gerald Weinberg, *Are Your Lights On?*** — short, funny, and entirely about
  whose problem it is. Read it before the first client meeting.
- **Kent Beck, *Extreme Programming Explained*** — the on-site customer and the planning game are
  the earliest clear statement of what a client owes and is owed.
- **Richard Cook, "How Complex Systems Fail"** — again, because paragraphs seven through twelve are
  about the people, and they are the best thing written on why blame is the wrong instrument.

`SOFTWARE-ENGINEERING.md` covers the taxonomy of unknowing, the cost of a test, and why practices
are fear retirement. `SOFTWARE-ENGINEERING-2.md` covers where requirements come from, state, and
conceptual integrity. This document assumes both and repeats neither; where it leans on one, it
says so.
