# Software Engineering II

Six ideas underneath the practice: where the problem comes from, what software is made of, and why
it costs what it costs.

`SOFTWARE-ENGINEERING.md` argues that most of engineering is managing what you don't know and what
you're afraid of. This document is about the other half — the **material** you're working in and the
**problem** you're working on — and it assumes you have read nothing. Not that file, not Brooks, not
a textbook. Where a term is needed it is defined here.

These six are not techniques. They are the things that, once you can see them, make a hundred
smaller rules stop being arbitrary.

| # | The idea                        | The one-line version                                                |
| - | ------------------------------- | ------------------------------------------------------------------- |
| 1 | Nobody hands you the problem    | Requirements are built, not collected. The client's solution is a guess. |
| 2 | State is the material           | Logic is easy. Everything hard is state: it persists, is shared, and ages. |
| 3 | Essential vs. accidental        | Some complexity is the problem's. The rest is yours, and it's invisible to you. |
| 4 | Conceptual integrity            | One coherent design beats every good idea. It shows up first in vocabulary. |
| 5 | Locality of reasoning           | Interfaces exist so you can be sure of a part without reading the whole. |
| 6 | Software is capital you carry   | The cost of a feature is build **plus** carry times lifetime. |

Every section is built the same way: the idea, why it is true, **a question you can actually ask**,
where it is made concrete in `parking/`, and what to do on your own project. That sameness is
deliberate — it is section 4 in action, and you should notice it working on you.

## Terms used here

Five categories of not-knowing, because they come up throughout. (`SOFTWARE-ENGINEERING.md` makes
the full argument; this is enough to read on.)

| Term   | Meaning                                                                    |
| ------ | -------------------------------------------------------------------------- |
| **K0** | You know it, and it's true.                                                 |
| **K1** | You know you don't know it. Cheap — you can go find out.                    |
| **K2** | You didn't know you didn't know. Only reality tells you.                    |
| **K3** | You're certain, and you're wrong. The expensive one: it triggers no search. |
| **K4** | A useful falsehood you keep **on purpose**, having written down where it's load-bearing. |

Two more words used precisely:

- **Observable behavior** — something you could check from outside without reading the source. "The
  page shows the age of a count older than fifteen seconds" is observable. "The code is clean" is
  not.
- **Contract** — the promises one part of a system makes to another, written down: what it accepts,
  what it returns, and how it fails. Not the code that keeps them.

---

## 1. Nobody hands you the problem

You are handed a sentence. *"We need an app that shows which lots have spaces."*

That sentence is not a requirement. It is a wish with a user interface already attached, and it is
the most dangerous input you will receive on the entire project.

### "Gathering requirements" is a false metaphor

The phrase suggests requirements exist — out there, in the client's head — and your job is to
collect them, like mushrooms. Nothing exists yet except two things:

- **a pain**, which is real evidence, and
- **a proposed solution**, which is a guess.

Clients almost always know their domain far better than you do. That is exactly what makes their
proposed solution dangerous: it arrives pre-formed, confident, and backed by the authority of the
person paying. It does not look like a question, so it triggers no investigation. That is the
precise shape of K3 — certainty that costs nothing at the time and everything later — except it is
now *someone else's* certainty, which you have inherited without an audit.

The move is to walk back up from the solution to the pain. *What happens today when a driver can't
find a space?* *Who gets the phone call?* *What do they say?* This question is nearly free, takes
one minute, and routinely changes the product. In the parking case the answer might be "the gate
staff radio each other and guess" — which means the real customer might be gate staff, not drivers,
and the real requirement might be about trust in a number rather than about a map.

**Keep the pain. Test the solution.**

### Writing it down is how you find out what they want

The second surprise is that requirements do not exist even in principle until someone writes a
candidate down. The client cannot tell you what should happen when a sensor goes silent, because
they have never owned a sensor and have never thought about it. They can absolutely tell you — in
about two seconds — when they read your sentence saying *the count freezes at its last known value
and the page keeps showing it as current.* "No! Absolutely not."

So the first draft's job is **to be wrong in a way that is easy to correct.** This has a consequence
students consistently get backwards:

> **Specific and wrong beats vague and safe.**

"The page refreshes every five seconds" gets corrected. "The page is responsive and up to date" gets
nodded at, agreed to, and means nothing — and you will discover in week nine that it meant something
different to each of you. Vagueness feels safer because nobody can object to it. That is the
problem: you have written a sentence that cannot be wrong, so it cannot teach you anything.

This is the same move as a test that fails before you fix the code. You state the precise claim so
that reality is *able* to reject it.

### The questions that actually extract requirements

None of these are about features. All of them get answers nobody volunteers.

| Ask                                                | Because                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| "How many? And in two years?"                       | "A city" is a mood. A number with a horizon is a design input.        |
| "What are we explicitly *not* building?"            | The cheapest scope decision there is, and it ends the same argument permanently. |
| "What happens if this input is absent? late? wrong? lying?" | Four cases every consumer inherits by accident if nobody asks.        |
| "What does a bad day look like?"                    | Surfaces availability and recovery, which nobody thinks to state.     |
| "How long may it be down, and when?"                | Unstated, the answer is 100%, the most expensive requirement you can accidentally accept. |
| "What would you do differently with this answer?"   | Kills features fast. If nothing changes, nobody needs it.             |
| "Who is affected who isn't in this room?"           | Bystanders, the surveilled, the person whose lot shows the wrong number. |

And one rule about all of them: **a requirement with no price attached is a wish.** Every sentence
in a requirements document is a purchase that somebody has to authorize.

### In `parking/`

`REQUIREMENTS.md` is what a constructed requirement set looks like. Three things in it are worth
studying as *technique*, not content:

**The `E` section is arithmetic done on the client's answers, not a transcript of them.** The client
said a hundred lots, a hundred thousand spaces, an event crowd arriving over two hours. Nobody said
anything about staleness thresholds. But `E-2` turns the crowd into 1.7 vehicles per second into a
single filling lot, and `E-5` then observes that a count ten seconds old is already wrong by
seventeen spaces — so the staleness threshold in `N-3` and `U-2` is *derived from the fill rate,
rather than chosen as a round number.* Nobody could have handed you that requirement. It had to be
built out of two things the client did know.

**`E-6` shows that the shape of an answer matters as much as its value.** Availability is stated as
five seconds a day outside 02:00–04:00 and one hour inside. The section then points out that the
same system is 99.994% available if you quote the day it protects and 95.8% if you quote the whole
day — which is why the window has to be *named* rather than folded into a number of nines. A single
number would have been easier to agree to and would have meant nothing.

**`E-10` is a requirement no client would ever state.** Local time is not monotonic: twice a year an
hour never happens and an hour happens twice, so the maintenance window is sometimes one hour wide
instead of two and an instant inside the repeated hour is ambiguous. That started as K2 — nobody
knew to ask — and somebody moved it to K0 by thinking about the edge before it arrived at 2am on a
Sunday in March.

Then notice what the document does with what it *doesn't* have. Under `E` there is a heading called
**"Not yet answered"**, listing four open recovery questions, and it says plainly: *until these are
answered these are guesses nobody has agreed to.* That is the honest state of a real requirements
document. Compare it to the `Scope decisions` and `Non-goals` sections, which record what was
decided *against*, so it stops being re-argued.

### On your project

Your client is probably an instructor, a stand-in stakeholder, or your own imagination. The failure
mode of an imagined client is that you become your own client and are never corrected — every guess
you make is confirmed by the only person who could dispute it.

So: **nominate an actual human**, and go get corrected by them on a schedule you set in advance.
Where there is genuinely nobody, write requirements in a form that can still be wrong — numbered,
observable, testable — and put the numbers in even when you had to invent them, marked as invented.
An invented number that is written down can be challenged. An assumed one cannot.

### How this fails

You build exactly what was asked, on time, correctly, and it is not used. No test suite in existence
detects this. Only a person looking at the running thing does — which is why a demo to a real human,
early and repeatedly, is not a courtesy. It is the only instrument you have for this entire class of
error.

---

## 2. State is the material

Every discipline has a material, and its material's properties explain most of its rules. Concrete
is strong in compression and weak in tension, so you put steel in the tension side and every rule
about rebar follows. Software's material is not code. Code is the *description*. The thing that
actually runs is **state, plus the rules that change it.**

### Why state, specifically, is the hard part

A function that takes inputs and returns a value is easy in a way you may not have noticed. You can
call it. You can call it again and get the same answer. You can test it by writing down an input and
an expected output, and that test will be true forever.

State has four properties, and each one takes something away from you.

**It persists.** It outlives the code that created it. So when you change the code, the new code
meets data written by the old code — data you cannot reach and cannot re-run. That is the whole
migration problem (`V-7`). The smallest possible demonstration is in this repository: `db/init.sql`
runs *only on an empty volume*, so if you change the schema and run `docker compose up` without
`down -v`, you get new code and the old database, no error message, and behavior nobody designed.

**It is shared.** Two parties read the same value, and they can disagree about what it is right now.

**It ages.** A value that was true when you read it may be false when you use it. Freshness becomes
a property of data that the type system knows nothing about.

**It changes while being observed.** Two writers, one value, no agreed order.

From which comes the definition worth memorizing:

> **The difficulty of a system is not how many features it has. It is how much state a change can
> reach.**

That is also what "coupling" actually means, which otherwise stays a vague virtue you get marked
down for violating.

### Anything that might be out of date is a cache

This is the single most useful renaming you can perform on your own code. A cache is not a thing you
install; it is any copy of state that might not match the original. Once you call something a cache,
you inherit the complete list of questions about it: *how stale can it get, how would you know, and
what happens to the user while it is wrong?*

Go and find every cache in your system that nobody labelled one. A variable holding something
fetched five minutes ago. An array in the browser that a `setInterval` refreshes. A denormalized
count column. A JSON Web Token.

`parking/` contains the same design decision made twice, in opposite directions, which is why it is
a good place to learn this.

**The app's login token is a cache.** `app/index.js` signs a token carrying `role`, `lot_id`, and
`is_root`, with `expiresIn: '8h'`. `getUserFromRequest` verifies the signature and returns the
payload — it never re-reads the user row. So if an admin demotes someone, that person keeps their
old permissions for up to eight hours. Described as authentication, that sounds like a quirk.
Described accurately — **a cache with an eight-hour TTL and no invalidation** — it tells you exactly
what can go wrong and how bad it can be.

**The device registry is deliberately not a cache.** `DESIGN.md` has the collector read the
`devices` table on every poll cycle, and says why: it makes revocation effective within one interval
(`I-4`) *"without a cache to invalidate."* Same system, same kind of decision, opposite answer —
because revoking a compromised sensor is not something you can afford to have take effect eight
hours later.

Neither choice is universally right. Being able to say which one you made, and what it costs, is the
skill.

### There is no single "now"

Once state lives in two places joined by a network, there is no shared present tense. In `parking/`:
the sensor knows a count; the collector knows what the sensor said four seconds ago; the browser
knows what the app said three seconds before that. All three are locally correct and they disagree.

So the design question is never "keep them in sync," which is not achievable. It is:

> **How wrong may each copy be, and who gets told?**

That question is the entire `C` and `U` sections of the requirements. And note `E-5`: at peak, a
count that is *fresh by the clock* — ten seconds old — is already off by seventeen spaces. Freshness
and correctness are different properties, and a system can fail the second while passing the first.

Four beliefs that feel like K0 and are K3, in the order they cost the most:

| The belief                         | Reality                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| The message arrives                 | It may not. (`C-1`: every call gets an explicit timeout.)       |
| It arrives once                     | A retry means it may arrive twice.                              |
| It arrives in order                 | Two paths, two latencies, no guarantee.                         |
| The clock is right                  | `N`, and the `skewed` fault, which produces plausible data with a valid signature and a clock off by minutes. |
| The write succeeded because the call returned | The response may be what got lost.                    |

The defense against arriving twice is worth naming because it is a design technique rather than a
warning: **make the operation idempotent** — doing it twice equals doing it once — and "did that go
through?" stops being a question you have to answer. `"Set available to 37"` is idempotent. `"One
car arrived"` is not. That is not an abstract example; it is the difference between the reading
model in `S-1` and the old push endpoint `POST /api/lots/:id/occupancy` that `REQUIREMENTS.md` marks
for retirement.

### Time deserves its own paragraph

`parking/` splits one apparently simple idea — *how old is this?* — into two fields, and the reason
is the best small lesson about state in the repository.

- `as_of` (`S-2`) is the wall-clock time the count was **taken**. It is meaningful across machines
  and it is a lie whenever the clock is wrong.
- `age_ms` (`S-3`) is elapsed time from a **monotonic** source — a counter that only ever moves
  forward and does not jump when the clock is corrected. It is meaningless across machines and it
  cannot be forged by a bad clock.

Staleness is computed only from `age_ms` (`N-3`), so a sensor with a fast clock cannot make old data
look fresh. Then `N-4` has the collector stamp its own receipt time, because **two independent
clocks are what make disagreement detectable at all** — and `N-5` says that when `age_ms` and
`as_of` disagree, the conclusion is *the clock is broken*, not *the data is old*.

Wall clock and monotonic clock are different instruments measuring different things. Almost every
time-related bug you will write for the next five years is using one where the other was required.

### Practical moves

- **Derive instead of store.** Anything computed can't go stale. `app/index.js` computes `available`
  in SQL as `CASE WHEN is_open THEN capacity - occupancy ELSE 0 END`, in one shared fragment reused
  by every lot query, and the browser never computes it. One place can be wrong instead of five.
- **Say which copy is authoritative.** `S-6`: the sensor reports its capacity, the database remains
  authoritative, and *a mismatch is a fault, not a correction.* Any value that exists twice needs
  this sentence written down somewhere.
- **Put state's age in the data, not just the label.** `age_ms` is a field, so it can be tested;
  "last updated" in the corner of a page cannot.
- **Push logic away from state.** Pure functions in the middle, state at the edges. `contract/` is
  layer 0 and holds no state at all, which is exactly why its eighteen tests are free to run.
- **Record what a decision was based on.** `C-9` requires the inputs to every derived state:
  *"Marked lot 3 stale: age 47s exceeded threshold 15s"*, not *"sensor returned 200."* State that
  explains itself is state you can debug a week later.

### On your project

Make a list of every piece of state in your system and, for each: who owns it, who else has a copy,
how stale a copy may be, and what happens to a user while it is wrong. It takes twenty minutes. It
is the highest-value twenty minutes available to you, and roughly none of it is visible in a class
diagram.

Then notice which of your components hold no state at all. Those are the ones that will be easy for
the rest of the term, and that is not a coincidence.

---

## 3. Essential and accidental complexity

Some of the difficulty in your project comes from the problem. The rest comes from how you chose to
build it. Fred Brooks named these in 1986 — **essential** and **accidental** complexity — and the
distinction is the only reliable way to end a design argument.

**Essential complexity is in the problem.** It survives every rewrite, every framework, every
language, and every model. `parking/` has a lot of it, and all of it is traceable to a sentence
somebody agreed to:

- Sensors lie, freeze, hang, and drift (`F`) — because real hardware does.
- Clocks disagree (`N`) — because they do.
- The network drops requests (`C`) — because it does.
- A driver must be told the difference between a live count, an old count, and no data (`U-1`) —
  because showing "12 spaces" for a forty-minute-old reading is the failure the system exists to
  prevent.
- Sensors cannot be upgraded all at once, so mixed versions are the normal condition (`V-3`).
- Parking data is location data about people, so "counts, not locations" is a scope decision with an
  ethical reason.
- Eight languages, because the users have eight languages.

You cannot engineer any of that away. You can only decide where to handle it.

**Accidental complexity is yours.** The build step, the bundler, the ORM, the five layers of
indirection, the config format you invented on a Tuesday. All real work, all needing maintenance,
none of it demanded by anyone.

### The question that settles it

> **What requirement would have to disappear for this complexity to go away?**

If you can name one, it is essential — and the conversation is with the client about whether that
requirement is worth its price, not with your teammate about code style. If the honest answer is
"none," it is accidental, it is yours, and it has to justify its carrying cost like anything else.

This matters more than it sounds, because most design arguments are **category disputes conducted as
taste disputes**. One person says "this is too complicated"; the other says "the problem is
complicated." Both are true. Neither is responsive. The question above converts an argument with no
end into a question with an answer.

### The trap

**Accidental complexity you introduced is invisible to you, because you understand it.** You built
it, so it costs you nothing to navigate, and you will sincerely believe it is simple. It is charged
to strangers — and in about a month, to you.

This is why "it's simple once you know how it works" is not a defense. Everything is.

### In `parking/`

Look at what this repository *refuses*, and at the reason attached to each refusal:

| Refused                          | Stated reason                                                   |
| -------------------------------- | ---------------------------------------------------------------- |
| A test framework                  | `node:test` is built in, so `parking/package.json` has no dependencies at all. |
| A bundler or transpiler           | `app/public` is plain static files; editing one needs a browser reload. |
| A linter, a build step            | Neither is present. Nothing needs building to run.               |
| YAML for the OpenAPI document     | `JSON.parse` is built in; `js-yaml` is a dependency. |
| A JSON Schema validator           | *"Nothing consumes these schemas at runtime so far... adding one now would be speculative structure."* |
| Canonical JSON for signatures     | Encoders disagree invisibly, so signing strings are explicit and pipe-joined: *"We avoid the problem rather than solve it."* |
| Three crypto algorithms           | Ed25519 for all three jobs: *"one primitive means one thing to learn and no parameter choices to get wrong."* |

None of those are minimalism for its own sake. Each is a decision that the essential complexity of
this system — lying sensors, skewed clocks, provenance — is hard enough that no attention should be
spent anywhere else. Every dependency removed is a thing a student does not have to learn, trust,
audit, or update.

And the last two are worth studying as a *technique*: when you meet accidental complexity, first try
to make it not exist. Canonical JSON is a genuinely hard problem, correctly solved by nobody in this
repository, because the design sidesteps the need for it.

### The part about agents

Brooks's actual claim in 1986 was that most of the easy accidental complexity had already been
harvested, so no single tool would ever deliver an order-of-magnitude improvement. Coding agents are
the first serious test of that claim in forty years, and the result so far fits it exactly.

Agents are extremely good at accidental complexity: boilerplate, glue, translation packs, the second
and third test case, the fixture, the migration script. They are no help at all with essential
complexity, because essential complexity is *what the problem is*, and deciding what the problem is
was never the typing.

So the enormous speedup people report is real, and it is concentrated in the part that was never the
hard part. That is not a disappointment; it is the shape of the thing, and it tells you where to
spend what you saved.

### On your project

Write your system's essential complexity on one page. Five to fifteen lines, each traceable to a
requirement. Anything you are maintaining that does not appear on that page is accidental, and
should be able to say why it exists.

Do it in week three, when the answer is still short.

---

## 4. Conceptual integrity

> It is better to ship one coherent design missing several good ideas than a system containing every
> good idea and no coherence.

That is Brooks's central claim, and it is the least intuitive idea in this document, because every
individual decision that destroys coherence was a good decision when it was made.

### Why coherence beats correctness-per-part

People understand systems **by analogy**. You learn how one part works, and then you *guess* how the
next part works. Coherence is what makes the guess right.

Every place your guess fails is something you must instead memorize. A person can memorize a few
dozen exceptions before they stop trying — and what they do next is the thing that actually kills
codebases: they stop reasoning and start copying whatever nearby code seems to work.

So a codebase does not become unmaintainable when it gets large. **It becomes unmaintainable when
guessing stops working.** That can happen at four thousand lines.

### It shows up first in vocabulary

The words are the visible surface of the design, and they are the cheapest thing to get right.

**One thing, one word.** If the client says "lot," the schema says "facility," and the UI says
"garage," you do not have one system with three labels. You have three mental models and a
translation layer that exists only inside one person's head — and that person is going to graduate.

**One word, one thing.** The reverse error is worse because it is silent. If "reading" means both
the message a sensor sent and the row you stored, you will eventually confuse them somewhere the
types cannot catch.

`parking/` treats this as a requirement rather than a style preference. `I-1` insists that four
identities stay distinct — the **device** (which sensor), the **caller** (admin, ops, collector),
the **release key** (who signed a firmware package), and the **artifact** (which firmware) — and
gives the reason: *an admin's login must never be the thing that signs a release.* That is
vocabulary discipline with a security consequence.

The sharpest example is a word the system deliberately declines to reuse. `S-4` says `status` is the
sensor's assessment of **itself** — `ok` or `degraded` — and that a sensor may never report that it
is offline, because *"if it can answer, it is not offline."* Reachability is a conclusion the
consumer draws. So the collector's derived state in `C-4` — `live`, `stale`, `unreachable` — is a
different concept, with a different name, computed by a different party. Two ideas that a careless
design would have merged into one field called `status`, and every consumer downstream would have
inherited the confusion.

### It shows up second in shape

Once vocabulary is settled, uniformity of *form* does the same work:

- One error envelope on every endpoint and every version (`V-5`), with `code` from a closed set and
  `message` never parsed by anything.
- Retryability stated explicitly in the body (`V-6`) rather than inferred from the status code —
  *"because the inference rules are exactly what people get wrong."*
- One README per component, all the same shape, each stating its contract.
- Stable requirement IDs referenced from tests, reviews, and commits, so `grep S-8` walks from a
  test to the sentence that demanded it.

Uniformity is not aesthetic. **If everything is uniform, the one weird thing is a signal. If nothing
is uniform, the weird thing is invisible.**

And coherence is not rigidity: `/health` is deliberately *not* versioned, because a versioned
discovery endpoint has a bootstrap problem — you would need to know the version in order to ask
which versions exist. The exception is fine. The exception being written down, with its reason, is
what keeps it from being noise.

### Somebody has to hold it

Coherence is the one property that does not live in any part. It lives *between* the parts, which
means no amount of careful local work produces it and no test can check it. Somebody has to be
holding the whole shape in their head, and most of that person's job is saying no — including to
good ideas, especially to good ideas, because a good idea is exactly what a coherent design most
often has to refuse.

On a team of four this is an assignable role, not a title. Rotate it if you like. Leave it vacant
and you will get four locally excellent designs and one incoherent system.

**This is why `AGENTS.md` says humans own the structure and agents author and advise.** An agent
produces a locally reasonable design every session and remembers no conventions between them. Ten
locally reasonable designs compose into something nobody can hold. The thing that cannot be
delegated is coherence — not because agents write bad code, but because coherence is a property of
the whole and each session only ever sees a part.

### On your project

Keep a glossary. Ten to thirty terms, one line each, at the top of your requirements document. Treat
the appearance of a *new noun* as an event that needs a decision: is this a new thing, or is it a
second name for a thing we have?

It is the cheapest document you will ever write, and it is the one that makes everything else agree.

---

## 5. Locality of reasoning

Most courses justify interfaces with **reuse**: write it once, use it twice. That reason is weak.
Reuse is a bonus when it happens, and a trap when you design for it — code shaped to serve two
callers is usually worse at both jobs than two clear versions would have been.

The real reason is arithmetic about human memory.

### Nobody can hold a large system in their head

So correctness has to be establishable in **pieces**. If you can check that A honors its contract,
and separately check that B honors its contract, then you can use A and B together *without
re-reading A*. Your confidence in the whole is assembled from confidence in the parts.

That property — call it locality of reasoning — is not a nicety. It is the only reason systems
larger than one person's head can exist at all. Every rule you have been taught about modules,
layers, encapsulation, and dependency direction is downstream of it.

### The test of an abstraction

> **Can you use it correctly without reading its implementation?**

If yes, it is an abstraction and it is doing its job. If you have to look inside to use it right, it
is not an abstraction — it is a function call with extra steps, and the boundary it advertises is a
lie. That is *worse* than no boundary at all, because a reader who trusts it will be wrong in a way
they had no reason to check.

### Abstractions fail the same way every time

Something true on the inside escapes to the outside. Four flavors, all present in `parking/`:

| Leak         | What it looks like                                                       |
| ------------ | ------------------------------------------------------------------------ |
| Failure      | A call whose contract says "returns a number" and whose reality includes a timeout. `C-1` exists because of this. |
| Time         | Something that looks like reading a variable and is a network round-trip. |
| Meaning      | `F-2`: the `stuck` fault returns HTTP 200. The abstraction says "200 means success"; success does not mean *current*, and a consumer that conflated them is now confidently wrong. |
| Trust        | `F-4`: the `skewed` fault — plausible data, valid signature, clock off by minutes. Everything verifies and the conclusion is still wrong. |

From which the rule: **a contract that does not state how it fails has not stated anything.** This
is why "absent, late, wrong, lying" is a requirements-level question and not an implementation
detail. Failure behavior is part of the interface, or the interface is fiction.

### What this justifies in `parking/`

Almost every structural rule in the repository is this idea wearing different clothes:

- **The dependency rule.** `cli/check-layering.sh` enforces that a folder may require only from a
  strictly lower layer — contract at 0, libraries at 1, services at 2, and nothing may require a
  service because there is no layer 3. It exits nonzero so CI can gate on it, and the script says
  why in its own header: *"without one, folder boundaries become decoration within a month."* The
  rule is what lets you read layer 1 without reading layer 2.
- **A contract folder that exists before its consumers.** `contract/README.md` states the purpose in
  one sentence: *"It exists so that two people can build the sensor and the collector without
  talking to each other."*
- **`T-4`, which is locality written as a requirement.** *A sensor written by anyone, in any
  language, can be verified against this specification without reading its source.* That is the
  abstraction test, promoted to something CI can run.
- **`I-5`, which is locality in the data model.** Any stored reading can be verified against the
  device registry without contacting the sensor — so a reading remains checkable years later, by
  someone who has never met the machine that produced it.
- **Choosing a library over a service on purpose.** `identity/` stays a library because verification
  must work without a network hop; making it a service would add a timeout and an outage that stops
  everything.

### The same thing is true of people

The interface between two developers is the same object as the interface between two modules.

"I'll build the collector, you build the journal" only works if the contract between them is written
down first. Otherwise you have not divided the work — you have scheduled an argument for week nine,
and it will be resolved by whoever has less time to be flexible.

This is also the mechanism behind the most-quoted line in software management, Brooks's *adding
people to a late project makes it later*: more people means many more pairs of people, every pair
needs an interface, and the interfaces you did not write down get negotiated in meetings instead.

### On your project

Before you split work between people, write the contract between the pieces — the function
signatures, the data shapes, the error cases — and check it in. Then both people can start on the
same day. It takes an hour and it is the difference between integrating continuously and integrating
in a panic.

---

## 6. Software is capital you carry

Ask a student what a feature costs and they will tell you how long it takes to build. That is the
down payment.

> **cost = build + (carry × lifetime)**

**Carry** is everything you pay for as long as the code exists: attention (every future reader must
route around it), review time, dependency upgrades, security surface, onboarding, and the chance it
breaks something else when you change a neighbor. None of it appears on a schedule. All of it is
real, and the sum of it is where most of the money in this industry goes.

Software is not inventory you ship and are done with. It is capital you carry.

### What follows

- **"Should we build this?" was never a build-cost question.** A feature that takes an afternoon and
  lives five years is not an afternoon's decision.
- **Every dependency is a permanent obligation** — something someone must learn, trust, audit, and
  update, forever, including the week it publishes a CVE. Adding one is a proposal, not a decision.
- **Deletion is usually the highest-return work available, and nobody schedules it.** Removing a
  feature nobody uses returns its carry every week for the rest of the project. It also earns no
  credit, which is exactly why it has to be a named, scheduled activity rather than a virtue you
  hope somebody has.
- **Sunk cost is sunk.** Code you wrote is not an asset you must defend. The hours are gone whether
  you keep it or delete it; the only live question is what it costs *from here*.
- **The reader you are writing for is you, having forgotten.** Most carry is paid by the future
  version of the person who wrote it, which is the one piece of good news in this section: you are
  optimizing for someone whose interests you can predict exactly.

### Carry that you chose is fine

The point is not to carry nothing. It is that carry should be **declared**.

`attic/parking/` is the original demo, kept deliberately, with the reason written down: it is the
before-picture — competent code that satisfies almost none of these requirements, and *none of what
it is missing would be caught by a conventional review.* That is carry with a purpose, stated, and
nothing depends on it.

`DESIGN.md` ends with a section titled **Deferred**, whose first line is *"Named so they are not
mistaken for oversights"* — signing key rotation, mTLS, a log pipeline. That is the opposite of
carry: work explicitly not taken on, so that its absence is a decision instead of a gap.

And `REQUIREMENTS.md` schedules a deletion. The `Migration` note says the old push endpoint and the
`sensor` role are superseded by device identity, and to retire both when the collector lands,
because *"two ingestion paths with no clear story is worse than either one alone."* Deletion,
written down in advance, with the reason.

### Data is carried too, and it is the heaviest thing you own

Code you can rewrite in an afternoon. Data you cannot.

`E-4` sizes the reading stream at twenty a second — 1.7 million rows a day, 630 million a year. Then
`E-8` draws the consequence, and it is the most sobering sentence in the requirements: an hour is
not long against those row counts, so *"a migration that scans the reading table is not a migration
this system can perform."*

Read that again. The data they will accumulate has **removed a future option**. Not made it
expensive — removed it, inside a stated maintenance window they agreed to. That is what carry does
when nobody counts it, and it is why persistent state is the part of a system with real mass.

The logging requirements make the same trade explicitly rather than by accident: `L-12` notes that
four sensors at a five-second interval already produce seventy thousand events a day, nearly all
uneventful, so steady-state successes are recorded at debug severity or sampled while state
transitions are always kept. Retention (`A-5`) is a policy executed out of band. Somebody decided
what to carry.

### On your project

At the end of every iteration, ask one question: **what can we delete?** Code, features,
dependencies, config options, dead branches, a table nobody reads.

And keep the list of what you decided *not* to build. It is the cheapest documentation in any
project: it ends the same argument three separate times, and it tells the version of you that exists
in November why the obvious thing was not done in September.

---

## Two laws worth memorizing

### Goodhart's law

> **When a measure becomes a target, it stops measuring.**

Not because people are dishonest. Structurally: the measure was a *proxy* for something you actually
cared about, and optimizing the proxy detaches it from the thing.

- Aim at test coverage percentage, and you get tests with no assertions.
- Aim at velocity, and estimates inflate.
- Aim at uptime, and incidents get reclassified as maintenance.
- Aim at lines of code, and you get lines of code.

This document should be honest about the version that will affect you first: **`T-3` says every
requirement that says "must" has a test naming its ID.** The moment that is graded, it is possible
to produce tests that name IDs and assert nothing at all. That satisfies the letter of the rule and
destroys the entire reason for it, and it will look like compliance in every report anybody runs.

The only defense is to keep the *reason* attached to the rule everywhere the rule appears. A
practice whose purpose has been forgotten is already being gamed, including by people who think they
are following it.

`parking/` has two requirements that exist purely to protect a signal from being drowned:

- `L-5`: an injected fault is **not** an error, because if the fault modes fill the error log, the
  error log becomes noise and stops being read.
- `E-9`: scheduled maintenance is a state, not a fault, because *"a system that goes red every night
  at 2am teaches its operators to ignore red."*

Both are Goodhart defenses. An alarm that fires when nothing is wrong is not a cautious alarm; it is
a broken one, and its brokenness is invisible right up until the night it was needed.

### A bug you cannot reproduce is a rumor

You cannot fix a rumor. You can only change something and then fail to observe the symptom — which
feels exactly like fixing it, and is the most common way a bug gets "fixed" twice.

**Reproduction is what converts an anecdote into an object** you can hold still, take apart, and
verify you have actually changed. So the first move on any bug report is never a hypothesis. It is a
reproduction.

This is what the `T` requirements are actually buying:

- `T-1` bans unseeded randomness — deterministic sequences, exact asserted values — so a failure is
  the same failure tomorrow.
- `T-2` drives faults through the control plane instead of waiting for them: set `down`, poll,
  assert `unreachable`, set `ok`, assert recovery. A fault you can cause on demand is a fault you
  can study.
- `T-5` returns the whole system to a known state in one command, so "it works here" and "it fails
  there" become comparable claims.
- `C-9` and `L-4` require every derived state to record the inputs that produced it, so a failure in
  production arrives already carrying its own reproduction.

Notice that all four are about lowering the cost of the *next* investigation, not about this one.
That is the shape of nearly all good engineering investment.

---

## The whole document as questions

If you remember nothing else, remember that each of these is a question you can ask out loud in a
meeting, and that each one has an answer.

| Ask                                                          | And you are checking |
| ------------------------------------------------------------- | -------------------- |
| "What happens today when this goes wrong, and who gets the call?" | that you have the problem, not the client's guess (1) |
| "What is this a copy of, and how stale can it get?"            | that you have named your caches (2) |
| "Which copy is authoritative?"                                 | that state has an owner (2) |
| "What requirement would have to disappear for this to go away?" | essential or accidental (3) |
| "Is that the same thing we called something else on Tuesday?"   | vocabulary, and therefore the design (4) |
| "Can I use this without reading inside it?"                     | whether the seam is real (5) |
| "How does it fail, and is that in the contract?"                | whether the seam holds under load (5) |
| "What does this cost us every week for the next two years?"     | carry, not build (6) |
| "What can we delete?"                                           | the return nobody schedules (6) |
| "If we grade this, what's the cheapest way to fake it?"          | Goodhart, before it happens to you |

## Where these arguments come from

Short list, one line each on what the source actually says, so you can pick one rather than all.

- **Fred Brooks, *The Mythical Man-Month* (1975)** — conceptual integrity, and why adding people to
  a late project makes it later. Chapters 2, 4, and 16 carry most of it.
- **Fred Brooks, "No Silver Bullet" (1986)** — the essential/accidental distinction in section 3, in
  about fifteen pages.
- **David Parnas, "On the Criteria To Be Used in Decomposing Systems into Modules" (1972)** — the
  origin of section 5. Two ways to split the same small program, and why the one that hides
  decisions wins. Still the clearest thing written on the subject.
- **John Ousterhout, *A Philosophy of Software Design*** — the most student-friendly modern
  treatment of section 5; "deep modules" is the abstraction test stated as a design goal.
- **Rich Hickey, "Simple Made Easy" (talk, 2011)** — simple is about how tangled a thing is; easy is
  about how familiar it is. They are not the same, and confusing them is how accidental complexity
  gets defended.
- **Leslie Lamport, "Time, Clocks, and the Ordering of Events" (1978)** — why there is no single
  "now" in a distributed system. Harder than the rest; worth it once section 2 has bothered you.
- **Richard Cook, "How Complex Systems Fail"** — eighteen short paragraphs, the best return per page
  in the whole list.
- **Michael Nygard, *Release It!*** — failure as an input, with the patterns named: timeouts,
  bulkheads, circuit breakers. Reads directly onto the `C` requirements.

`SOFTWARE-ENGINEERING.md` in this repository covers the parts this document assumes but does not
argue: the taxonomy of unknowing, the cost of a test, why practices are fear-retirement, and what
changes when agents are in the loop.
