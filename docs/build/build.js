'use strict';

// Builds the course web resource in docs/ from the repository's own documents:
//
//   docs/index.html                              the Pages entry point: the three resources, and the parts
//   docs/software-engineering-field-guide.html   one page, no dependencies, navigation and figures
//   docs/software-engineering-reference.md       the same content as plain Markdown
//
// Run from anywhere:   node docs/build/build.js
//
// The sources are the two essays in the repository root, docs/TEAM-AND-CLIENT.md, the documents in
// parking/, AGENTS.md, and CONTRIBUTING.md. Edit those and rebuild; never edit the generated files.
// The only prose that lives here is the preface, the glue in the parking chapter, the glossary, and
// the landing page's one-sentence dek. All three outputs are written from one model, so a part added
// to `parts` reaches the guide, the reference, and the landing page's contents together.
// A heading that this script looks for and cannot find fails the build, on purpose: a renamed
// section in REQUIREMENTS.md should break the page, not silently drop out of it.

const fs = require('fs');
const path = require('path');
const md = require('./markdown');
const figures = require('./figures');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_HTML = path.join(ROOT, 'docs', 'software-engineering-field-guide.html');
const OUT_MD = path.join(ROOT, 'docs', 'software-engineering-reference.md');
const OUT_INDEX = path.join(ROOT, 'docs', 'index.html');
const GITHUB = 'https://github.com/wmacevoy/software-engineering-wmacevoy-fall-2026';
const COURSE = 'CSCI 490 · Software Engineering';
const TITLE = 'A Field Guide to Software Engineering';

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ---- what the page is made of -------------------------------------------------------------

const PREFACE = `
This is the course's written material in one place: two essays, a guidebook on teams and clients,
the working documents of the \`parking/\` example, and the two files that say how work is accepted
in the repository. Nothing here was written for this page. It is generated from those files by
\`docs/build/build.js\`, so it cannot drift from them — and if this page and the repository ever
disagree, the repository is right and this page is stale.

| Part | What it covers                                                                                                                                                  | Source                                   |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| I    | What engineers are for; the five kinds of not-knowing; fear, time, and the cost of a test; failure as an input; provenance; scale, recovery, availability; agents — then the shape that the cost of a test gives the work (agile and waterfall, the vocabulary, and falling down the waterfall) — then testing as a guidebook: which fear each test retires, repeatability as a property of state and of the environment, and what to pin | \`SOFTWARE-ENGINEERING.md\`, \`AGILE_VS_WATERFALL.md\`, \`TESTING.md\` |
| II   | Where requirements come from, state as the material, essential and accidental complexity, conceptual integrity, locality of reasoning, carry cost              | \`SOFTWARE-ENGINEERING-2.md\`             |
| III  | The team as a first-order variable, roles, the client, the first conversation, iterations and demos — and the VIP pivot: one sentence from the client, heard late | \`docs/TEAM-AND-CLIENT.md\`               |
| IV   | The parking example: its component map, the requirement sections the essays keep citing, what is built and what is not, and how work is accepted               | \`parking/\`, \`AGENTS.md\`, \`CONTRIBUTING.md\` |
| V    | The essentials, in sequence: the shell, git, 1Password, issues and pull requests, Actions, Docker, packages, and agents — each with the fear it retires and the fence you prove | \`essentials/\` |

**The example is deliberately unfinished.** Of the ten components in \`parking/\`, three run: the
contract, the web app, and the database. The other seven have a README stating their contract and
no code. That is not a gap in the material; it is the material. The documents were written before
the code on purpose — Part I's argument that nothing in software has mass — and a difference between
what the documents say and what the code does is work to be done, not an error in the documents.

**Where to start.** If you have an hour: the taxonomy of unknowing in Part I, "Nobody hands you the
problem" in Part II, and the pivot in Part III. If you have an afternoon, read it in order; each part
assumes the one before it and says so where it leans on it.

**Conventions.** Requirement IDs like \`S-8\` refer to \`parking/REQUIREMENTS.md\`, where every "must"
has a test that names it. \`K0\`–\`K4\` are defined at the start of Part I and again, briefly, at the
start of Parts II and III. A file name in \`code\` links to the chapter that renders it, or to the
file in the repository.
`;

// The landing page's only prose. Everything else on it — the list of parts, their deks, the count
// in the field guide's description — is derived from `parts` below, so adding a part to the guide
// adds it to the landing page and cannot be forgotten.
const HOME_DEK = `What you don't know, what you're working in, and who you're working with — with one
partly built system, the parking example, that every argument is anchored in.`;

const PARKING_INTRO = `
\`parking/\` is the live system the essays keep pointing at. This chapter collects the documents
that define it — the component map, the shape of the system, the requirement sections most often
cited, and the decisions recorded so they are not relitigated — and ends with what is built and what
is not.
`;

const PARKING_SHAPE_HEAD = `
## The shape of the system
`;

const PARKING_SHAPE_TAIL = `
Sensors are servers. The collector polls them. Sensors never call in, except to append log entries.
Every box in the figure can be made to fail or lie on request — the time source and the aggregator
included (\`F-5\`) — because a system that only degrades correctly when its infrastructure is
healthy has not been tested.
`;

const PARKING_MAP = `
## A map of the requirements

\`REQUIREMENTS.md\` is organized into twelve lettered sections, each a group of numbered, observable
requirements. Every "must" in it has a test that names its ID (\`T-3\`). The sections the essays
cite most — \`E\`, \`F\`, the scope decisions, and the non-goals — are reproduced in full below; the
rest are one line each here, and in the file.

| Section                    | Letter | In one line                                                                                                  |
| -------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Operating envelope         | \`E\`  | How many, how badly it may break, how long it may be down — the client's numbers, and the arithmetic done on them |
| The sensor                 | \`S\`  | What a reading contains, and why \`as_of\` and \`age_ms\` are different instruments                             |
| Time                       | \`N\`  | A shared, faultable clock; staleness from the monotonic source, never from timestamps                          |
| Identity                   | \`I\`  | Four identities kept distinct; keys that never leave the device; enrollment and revocation                     |
| Versioning                 | \`V\`  | Versioned paths, a mixed-version fleet as the normal condition, one error envelope, migrations                 |
| Firmware updates           | \`G\`  | Signed packages, refusal of rollbacks, health-gated install with automatic revert                              |
| Access control             | \`A\`  | Who may read, change, and append — and that nobody may delete                                                  |
| The collector              | \`C\`  | Timeouts, isolation between sensors, derived \`live\`/\`stale\`/\`unreachable\`, validation at the boundary       |
| Logging and traceability   | \`L\`  | Structured, traceable, tamper-evident, witnessed; an injected fault is not an error                            |
| Fault and attack injection | \`F\`  | The switchboard, and seven attacks demonstrated before their defenses are built                                |
| What the driver sees       | \`U\`  | Live, aged, or unknown — never a stale count shown as current                                                  |
| Testing and verification   | \`T\`  | Deterministic sequences, faults driven on demand, conformance checkable from outside, one-command reset        |
`;

const PARKING_STATUS = `
## What is built, and what is not

Three of the ten components run. \`contract/\` is done: schemas, signing strings, error codes, and
version negotiation, with tests. \`app/\` and \`db/\` run — the Express server, and the Postgres
schema and seed — which is where the login-token cache and the derived \`available\` column that
Part II dissects actually live. The other seven — \`identity/\`, \`logger/\`, \`collector/\`,
\`sensor/\`, \`journal/\`, \`time/\`, and \`cli/\` beyond the layering check — have a README stating
their contract and no code.

Three things are true of that state, and each is a lesson rather than an apology:

- **The contract came first.** \`contract/\` is layer 0 and was built while every component that
  will use it was still a README. That is the flat schedule from Part I: the dependency was
  specified, not sequenced, and two people can now build the sensor and the collector without
  talking to each other.
- **The dependency rule is enforced, not described.** \`cli/check-layering.sh\` exits nonzero when a
  folder requires from its own layer or above, and \`npm run check\` runs it before the tests. A rule
  that is merely a convention is not a policy.
- **The VIP pivot in Part III is hypothetical.** \`REQUIREMENTS.md\` still lists reservations under
  \`Non-goals\`, and that one line is exactly where the collision would be found — by a grep, in a
  second, instead of in code review in week nine.

To run it: \`docker compose up --build\` from \`parking/\`, then \`http://localhost:3000\`. \`npm test\`
runs the contract tests with no install. \`docker compose down -v\` resets the database, and is
required after any schema change, because \`db/init.sql\` runs only on an empty volume.
`;

const GLOSSARY = `
Terms the three parts define in passing, collected. Each is one line here and argued at length
where it first appears.

| Term                        | Meaning                                                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **K0 … K4**                 | The five kinds of not-knowing: the known; the known unknown; the unknown unknown; erroneous certainty; a falsehood kept on purpose. K0–K3 are in order of expense. K4 is a choice. |
| **Observable behavior**     | Something you could check from outside without reading the source. Requirements are written in it; "the code is clean" is not.                                       |
| **Contract**                | The promises one part of a system makes to another, written down: what it accepts, what it returns, and how it fails. Not the code that keeps them.                    |
| **Working set**             | \`REQUIREMENTS_vX\`, \`DESIGN_vX\`, \`QUEUE\`, \`FINDINGS\` — the four documents that make a project's state observable from where every party stands, versioned with the code. |
| **Fence**                   | A checkpoint that proves something: a demo to a real client, a conformance run that exits nonzero, a deploy that happened. A status meeting is not one.               |
| **Iteration**               | A fixed period, one to two weeks, that ends at a fence: a running thing shown to the client, a diff to the requirements, a \`FINDINGS\` entry, a priced queue.          |
| **Client**                  | The person who can say yes, no, and how much. Their pain is evidence; their proposed solution is a guess.                                                             |
| **Proportion mismatch**     | The client sizes a requirement by their world — spaces, dollars, minutes. The design sizes it by the assumptions it invalidates. The gap between the two is where K2 lives. |
| **Read your K4s**           | Reading every scope decision and assumed falsehood back to the client as a question. Converts a K4 to a K1 at the price of one sentence.                              |
| **Essential complexity**    | Difficulty that belongs to the problem and survives every rewrite. Test: name the requirement that would have to disappear for it to go away.                          |
| **Accidental complexity**   | Difficulty you introduced. Invisible to you because you understand it; charged to strangers, and to you in a month.                                                   |
| **Conceptual integrity**    | One coherent design over every good idea. It shows up first in vocabulary — one thing, one word; one word, one thing — and somebody has to hold it.                     |
| **Locality of reasoning**   | Being able to be sure of a part without reading the whole. The real reason interfaces exist; reuse is a bonus.                                                        |
| **Carry**                   | Everything a piece of software costs for as long as it exists: attention, review, upgrades, security surface, the chance it breaks a neighbor. Cost is build plus carry times lifetime. |
| **Cache**                   | Any copy of state that might not match the original. Naming one inherits its questions: how stale, how would you know, and what happens to the user meanwhile.        |
| **Idempotent**              | Doing it twice equals doing it once, so "did that go through?" stops being a question. "Set available to 37" is; "one car arrived" is not.                           |
| **One-way door**            | A decision that cannot be cheaply undone: a schema with data under it, a published interface, a distributed key, a released image. Deliberate in proportion to it.    |
| **Provenance**              | Who said this, and can I check it later without asking them again — for a reading, a log record, a firmware image, and a commit alike.                                |
| **Designated liar**         | A component built to fail or lie on request so the handling of it can be seen to work. In \`parking/\`, the sensor; after the pivot, the gate as well.                  |
| **Operating envelope**      | The client's numbers — how many, how badly it may break, how long it may be down — inside which every other requirement is read. Section \`E\` of the requirements.    |
| **Availability budget**     | Tolerable downtime as a number with a period and a beneficiary. Unstated, it defaults to 100%, the most expensive requirement you can accidentally accept.            |
| **Thin vertical slice**     | The bridge: click to route to SQL to response, built end to end first and then thickened. Horizontal layers all finish at the same time — never.                        |
| **Mock**                    | A stand-in that answers, and misbehaves on request. A K4 by construction: a scheduling risk converted into an integration risk, a good trade only if you integrate continuously. |
| **Flat schedule**           | Everything startable at once, because every dependency between components has been written down as an interface, a mock, or a failing test rather than sequenced.     |
`;

const parts = [
  {
    kicker: 'Part I',
    title: 'The discipline',
    dek: 'Why we work this way: what engineers are for, and what most of the practice is actually managing.',
    chapters: [
      {
        id: 'discipline',
        title: 'Why We Work This Way',
        segments: [{ file: 'SOFTWARE-ENGINEERING.md' }],
        figures: [
          {
            after: 'The taxonomy of unknowing',
            svg: figures.ladder,
            caption:
              'K0 through K3 in order of expense. Looking something up is cheap; being confidently wrong costs whatever was built on the belief. Every practice in the repository moves something down the ladder before it charges full price. K4 is not on the ladder: it is a falsehood chosen, recorded, and kept.',
          },
          {
            after: 'Time',
            svg: figures.gradient,
            caption:
              'The avoidance gradient: nearly flat far from the deadline and steep at the end — arriving exactly when the project can least afford the behavior it produces. Fences that prove something flatten the curve. A status meeting does not, because it discharges nothing.',
          },
        ],
      },
      {
        id: 'shape',
        title: 'Agile and Waterfall',
        renumber: true,
        segments: [{ file: 'AGILE_VS_WATERFALL.md' }],
      },
      {
        id: 'testing',
        title: 'Testing',
        renumber: true,
        segments: [{ file: 'TESTING.md' }],
      },
    ],
  },
  {
    kicker: 'Part II',
    title: 'The material and the problem',
    dek: 'Six ideas underneath the practice, assuming no prior reading. Every section is anchored in parking/.',
    chapters: [
      {
        id: 'material',
        title: 'Six Ideas Underneath the Practice',
        renumber: true,
        segments: [{ file: 'SOFTWARE-ENGINEERING-2.md' }],
      },
    ],
  },
  {
    kicker: 'Part III',
    title: 'The people',
    dek: 'A guidebook: who builds the thing, who it is for, and what has to pass between them — including the iteration where the client mentions the VIP spaces.',
    chapters: [
      {
        id: 'team',
        title: 'Team and Client',
        renumber: true,
        segments: [{ file: 'docs/TEAM-AND-CLIENT.md' }],
        figures: [
          {
            after: 'What one sentence invalidates',
            svg: figures.blast,
            caption:
              'Two hundred spaces in a hundred thousand. Ten of the twelve lettered sections of the requirements, both scope lists, and the glossary that does not exist yet.',
          },
        ],
      },
    ],
  },
  {
    kicker: 'Part IV',
    title: 'The example',
    dek: 'The parking system as it stands — three components running, seven specified — and the two files that say how work on it is accepted.',
    chapters: [
      {
        id: 'parking',
        title: 'The Parking Example',
        segments: [
          { md: PARKING_INTRO },
          { file: 'parking/README.md' },
          { md: PARKING_SHAPE_HEAD },
          { figure: 'shape' },
          { md: PARKING_SHAPE_TAIL },
          { md: PARKING_MAP },
          {
            file: 'parking/REQUIREMENTS.md',
            sections: [
              'The system we are imagining',
              'Why this layer exists',
              'Scope decisions',
              'E — Operating envelope',
              'F — Fault and attack injection',
              'Non-goals',
              'Migration',
            ],
          },
          { md: PARKING_STATUS },
        ],
      },
      {
        id: 'agents',
        title: 'The Working Agreement',
        segments: [{ file: 'AGENTS.md' }],
      },
      {
        id: 'contributing',
        title: 'How a Change Is Accepted',
        segments: [{ file: 'CONTRIBUTING.md' }],
      },
    ],
  },
  {
    kicker: 'Part V',
    title: 'The essentials',
    dek: 'The tools, in the order a student needs them, each in the same shape: the fear it retires, the fence you prove, and what to do when it goes wrong.',
    intro: { file: 'essentials/README.md' },
    chapters: [
      { id: 'shell', title: 'The Shell', segments: [{ file: 'essentials/SHELL.md' }] },
      { id: 'git', title: 'Git', segments: [{ file: 'essentials/GIT.md' }] },
      { id: 'secrets', title: '1Password', segments: [{ file: 'essentials/1PASSWORD.md' }] },
      { id: 'issues', title: 'GitHub Issues and Pull Requests', segments: [{ file: 'essentials/GITHUB-ISSUES.md' }] },
      { id: 'actions', title: 'GitHub Actions', segments: [{ file: 'essentials/GITHUB-ACTIONS.md' }] },
      { id: 'docker', title: 'Docker', segments: [{ file: 'essentials/DOCKER.md' }] },
      { id: 'packages', title: 'Packages', segments: [{ file: 'essentials/PACKAGES.md' }] },
      { id: 'agent', title: 'Agents', segments: [{ file: 'essentials/AGENT.md' }] },
    ],
  },
];

// ---- links from `code` spans ---------------------------------------------------------------

// Files that render as chapters link to the chapter; anything else that names a real file or
// folder in the repository links to it on GitHub. A path that does not exist gets no link, which
// is the honest outcome for a document that mentions a file it expects someone to write.
const CHAPTER_OF = {
  'SOFTWARE-ENGINEERING.md': 'discipline',
  'SOFTWARE-ENGINEERING-2.md': 'material',
  'AGILE_VS_WATERFALL.md': 'shape',
  'TESTING.md': 'testing',
  'docs/TEAM-AND-CLIENT.md': 'team',
  'TEAM-AND-CLIENT.md': 'team',
  'parking/README.md': 'parking',
  'README.md': 'parking',
  'AGENTS.md': 'agents',
  'CONTRIBUTING.md': 'contributing',
  'SHELL.md': 'shell',
  'GIT.md': 'git',
  '1PASSWORD.md': 'secrets',
  'GITHUB-ISSUES.md': 'issues',
  'GITHUB-ACTIONS.md': 'actions',
  'DOCKER.md': 'docker',
  'PACKAGES.md': 'packages',
  'AGENT.md': 'agent',
};
for (const key of Object.keys(CHAPTER_OF)) {
  if (['SHELL.md', 'GIT.md', '1PASSWORD.md', 'GITHUB-ISSUES.md', 'GITHUB-ACTIONS.md', 'DOCKER.md', 'PACKAGES.md', 'AGENT.md'].includes(key)) {
    CHAPTER_OF[`essentials/${key}`] = CHAPTER_OF[key];
  }
}

function listRepo() {
  const files = new Set();
  const dirs = new Set();
  const skip = new Set(['.git', 'node_modules', '.viki', '.DS_Store']);
  (function walk(dir, rel) {
    for (const name of fs.readdirSync(dir)) {
      if (skip.has(name)) continue;
      const abs = path.join(dir, name);
      const r = rel ? `${rel}/${name}` : name;
      const stat = fs.lstatSync(abs);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) {
        dirs.add(r);
        walk(abs, r);
      } else {
        files.add(r);
      }
    }
  })(ROOT, '');
  return { files, dirs };
}

const repo = listRepo();

function codeLink(span) {
  const key = span.replace(/^(\.\.\/|\.\/)+/, '');
  if (CHAPTER_OF[key]) return `#ch-${CHAPTER_OF[key]}`;
  if (key === 'package.json') return null; // three of them; the essays mean different ones
  if (!/[/.]/.test(key)) return null; // not a path
  const bare = key.replace(/\/$/, '');
  for (const prefix of ['', 'parking/']) {
    if (repo.files.has(prefix + bare)) return `${GITHUB}/blob/main/${prefix}${bare}`;
    if (repo.dirs.has(prefix + bare)) return `${GITHUB}/tree/main/${prefix}${bare}`;
  }
  return null;
}

// ---- assembling a chapter -----------------------------------------------------------------

// The essays number their own sections ("section 7") and refer to them in prose. On this page
// they are numbered by chapter, so "section 7" in chapter 3 has to read "section 3.7".
function renumber(text, chapter) {
  return text
    .replace(/\b([Ss]ection) (\d)\b/g, `$1 ${chapter}.$2`)
    .replace(/\((\d)\)(\s*\|)/g, `(${chapter}.$1)$2`);
}

function figureBlock(svg, caption, mdFallback) {
  return {
    type: 'html',
    html: `<figure><div class="figure-frame">${svg}</div><figcaption>${md.escapeHtml(caption)}</figcaption></figure>`,
    md: mdFallback || `*Figure (on the web page): ${caption}*`,
  };
}

// The ASCII diagram in REQUIREMENTS.md stands in for the drawn figure in the plain-text edition.
function shapeFallback() {
  const section = md.extract(md.parse(read('parking/REQUIREMENTS.md')), 'Shape');
  const code = section.find((b) => b.type === 'code');
  return code ? md.toMarkdown([code]) : '';
}

function buildChapter(ch, number) {
  const blocks = [];
  for (const seg of ch.segments) {
    if (seg.figure === 'shape') {
      blocks.push(
        figureBlock(
          figures.shape,
          'Sensors are servers; the collector polls them. Time comes from a shared source that can be made to fail. Logs are appended, never deleted.',
          shapeFallback(),
        ),
      );
      continue;
    }
    let text = seg.file ? read(seg.file) : seg.md;
    if (ch.renumber) text = renumber(text, number);
    let parsed = md.parse(text);
    if (seg.sections) parsed = seg.sections.flatMap((title) => md.extract(parsed, title));
    parsed = parsed.filter((b) => !(b.type === 'heading' && b.level === 1)); // the file's own title
    blocks.push(...parsed);
  }
  for (const f of ch.figures || []) {
    md.insertBeforeNextHeading(blocks, f.after, figureBlock(f.svg, f.caption));
  }
  let k = 0;
  const seen = new Map();
  for (const b of blocks) {
    if (b.type !== 'heading') continue;
    b.outLevel = b.level + 1;
    if (b.level === 2) {
      k += 1;
      b.number = `${number}.${k}`;
      b.text = b.text.replace(/^\d+\.\s+/, '');
    }
    const base = `${ch.id}-${md.slug(b.text)}`;
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    b.id = n === 1 ? base : `${base}-${n}`;
  }
  return blocks;
}

// ---- the page -----------------------------------------------------------------------------

function tocHtml(model) {
  const items = [`<li><a href="#preface" class="toc-chapter" style="font-weight:400;font-size:.88rem;">Preface</a></li>`];
  for (const part of model) {
    items.push(`<li class="toc-part">${part.kicker} — ${md.escapeHtml(part.title)}</li>`);
    for (const ch of part.chapters) {
      const subs = ch.blocks
        .filter((b) => b.type === 'heading' && b.level === 2)
        .map((b) => `<li><a href="#${b.id}">${b.number} ${md.inlineHtml(b.text)}</a></li>`)
        .join('\n');
      items.push(
        `<li class="toc-chapter"><a href="#ch-${ch.id}">${ch.number}&ensp;${md.escapeHtml(ch.title)}</a>` +
          (subs ? `\n<ul class="toc-sub">\n${subs}\n</ul>` : '') +
          `</li>`,
      );
    }
  }
  items.push(`<li class="toc-part">Reference</li>`);
  items.push(`<li class="toc-chapter"><a href="#glossary">A&ensp;Glossary</a></li>`);
  return `<nav class="toc" aria-label="Table of contents">
<input type="checkbox" id="toc-toggle" class="toc-toggle-input" checked />
<label for="toc-toggle" class="toc-toggle-label">Contents <span class="chev">▾</span></label>
<div class="toc-body">
<ol>
${items.join('\n')}
</ol>
</div>
</nav>`;
}

function pageHtml(model) {
  const opts = { codeLink };
  const body = [];
  body.push(`<section id="preface">
<h2 style="border-top:none;margin-top:2.2rem;">Preface</h2>
${md.toHtml(md.parse(PREFACE), opts)}
</section>`);
  for (const part of model) {
    body.push(`<div class="part-divider" id="part-${md.slug(part.title)}">
<p class="kicker">${part.kicker}</p>
<h2>${md.escapeHtml(part.title)}</h2>
<p class="dek">${md.inlineHtml(part.dek, opts)}</p>
</div>`);
    if (part.introBlocks) body.push(`<section class="part-intro">\n${md.toHtml(part.introBlocks, opts)}\n</section>`);
    for (const ch of part.chapters) {
      body.push(`<section id="ch-${ch.id}">
<h2>${ch.number}&ensp;${md.escapeHtml(ch.title)}</h2>
${md.toHtml(ch.blocks, opts)}
</section>`);
    }
  }
  body.push(`<div class="part-divider">
<p class="kicker">Reference</p>
<h2>Appendix</h2>
</div>
<section id="glossary">
<h2>Appendix A — Glossary</h2>
${md.toHtml(md.parse(GLOSSARY), opts)}
</section>`);

  const css = fs.readFileSync(path.join(__dirname, 'theme.css'), 'utf8');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="The ${COURSE.replace(' · ', ' ')} field guide: what you don't know, what you're working in, and who you're working with — anchored in one partly built parking system.">
<title>Software Engineering Field Guide</title>
<style>
${css}
</style>
</head>
<body>
<!-- Generated by docs/build/build.js from the repository's documents. Do not edit; edit the sources and rebuild. -->
<div class="page">
${tocHtml(model)}
<main>
<header class="titleblock">
<p class="kicker">${COURSE}</p>
<h1>${TITLE}</h1>
<p class="dek">What you don't know, what you're working in, and who you're working with — with one partly built system, <strong>parking/</strong>, that every argument is anchored in.</p>
<p class="meta">Assembled from the essays and working documents of the Fall 2026 course (Dr. Warren MacEvoy). Generated from the repository; the files there are canonical, and a plain-text edition of this page lives beside it.</p>
</header>
<article>
${body.join('\n\n')}
</article>
<footer class="colophon">
<p>Generated from the course repository by <code>docs/build/build.js</code>. The plain-text companion is <code>docs/software-engineering-reference.md</code>; the sources are the essays, <code>parking/</code>, <code>AGENTS.md</code>, and <code>CONTRIBUTING.md</code> at <a href="${GITHUB}">${GITHUB.replace('https://', '')}</a>.</p>
</footer>
</main>
</div>
</body>
</html>
`;
}

// ---- the landing page ----------------------------------------------------------------------

// docs/index.html is the GitHub Pages entry point. It is generated from the same model as the
// field guide so that a part added there appears here too: the card descriptions, the list of
// parts, and the deep links are all read off `parts`, and the only hand-written sentence is
// HOME_DEK. Editing this file by hand is pointless — the next build overwrites it.
const NUMBER_WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numberWord = (n) => NUMBER_WORDS[n] || String(n);

// "the discipline, the material and the problem, … and essentials" — from the part titles, so it
// cannot describe a set of parts the guide does not have.
function partSeries(model) {
  const names = model.map((part) => {
    const t = md.escapeHtml(part.title);
    return /^(The|A|An) /.test(part.title) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
  });
  if (names.length < 2) return names.join('');
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function card(href, title, ext, desc) {
  return `  <a class="card" href="${md.escapeAttr(href)}">
    <span class="title">${title}<span class="ext">${md.escapeHtml(ext)}</span></span>
    <div class="desc">${desc}</div>
  </a>`;
}

function indexHtml(model) {
  const partsList = model
    .map((part) => {
      const href = `software-engineering-field-guide.html#part-${md.slug(part.title)}`;
      const chapters = part.chapters.map((ch) => ch.number);
      const span =
        chapters.length === 1
          ? `Chapter ${chapters[0]}`
          : `Chapters ${chapters[0]}–${chapters[chapters.length - 1]}`;
      return `    <li><a href="${md.escapeAttr(href)}">
      <span class="pkicker">${md.escapeHtml(part.kicker)} · ${md.escapeHtml(span)}</span><span class="ptitle">${md.escapeHtml(part.title)}</span>
      <div class="pdek">${md.inlineHtml(part.dek)}</div>
    </a></li>`;
    })
    .join('\n');

  const cards = [
    card(
      'software-engineering-field-guide.html',
      md.escapeHtml(TITLE.replace(/^A Field Guide to /, '')) + ' Field Guide',
      'Web page',
      `All ${numberWord(model.length)} parts — ${partSeries(model)} — formatted with navigation and figures.`,
    ),
    card(
      'software-engineering-reference.md',
      'Software Engineering Reference',
      'Markdown',
      'The same content as the field guide, as plain text.',
    ),
    card(
      GITHUB,
      'The repository',
      'GitHub',
      'The essays as they are written, and <code>parking/</code> — the system three components in, seven still specified and unbuilt.',
    ),
  ].join('\n');

  const css = fs.readFileSync(path.join(__dirname, 'home.css'), 'utf8').replace(/\s+$/, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Course resources for ${md.escapeAttr(COURSE.replace(' · ', ' — '))} (Fall 2026): the field guide, its plain-text reference, and the repository with the parking example.">
<title>${md.escapeHtml(COURSE.replace(/ · .*/, ''))} — Course Resources</title>
<style>
${css}
</style>
</head>
<body>
<!-- Generated by docs/build/build.js from the repository's documents. Do not edit; edit the sources and rebuild. -->
<main>
  <p class="kicker">${md.escapeHtml(COURSE)}</p>
  <h1>Course Resources</h1>
  <p class="dek">${md.inlineHtml(HOME_DEK.replace(/\s*\n\s*/g, ' ').trim())}</p>

${cards}

  <p class="section-label">What is in the field guide</p>
  <ol class="parts">
${partsList}
  </ol>

  <footer>
    <p>${md.escapeHtml(COURSE.replace(' · ', ' — '))}, Fall 2026 · Dr. Warren MacEvoy</p>
  </footer>
</main>
</body>
</html>
`;
}

function pageMarkdown(model) {
  const out = [];
  out.push(`# ${TITLE}`);
  out.push(
    `*${COURSE.replace(' · ', ', ')}, Fall 2026. Generated by \`docs/build/build.js\` from the repository's essays, \`parking/\` documents, \`AGENTS.md\`, and \`CONTRIBUTING.md\` — do not edit; edit the sources and rebuild. The web edition with navigation and figures is \`docs/software-engineering-field-guide.html\`.*`,
  );
  out.push('## Preface');
  out.push(md.toMarkdown(md.parse(PREFACE)));
  for (const part of model) {
    out.push('---');
    out.push(`## ${part.kicker} — ${part.title}`);
    out.push(`*${part.dek}*`);
    if (part.introBlocks) out.push(md.toMarkdown(part.introBlocks));
    for (const ch of part.chapters) {
      out.push(`## ${ch.number}. ${ch.title}`);
      out.push(md.toMarkdown(ch.blocks));
    }
  }
  out.push('---');
  out.push('## Appendix A — Glossary');
  out.push(md.toMarkdown(md.parse(GLOSSARY)));
  return `${out.join('\n\n')}\n`;
}

function main() {
  let n = 0;
  for (const part of parts) {
    if (part.intro) {
      // A part's introduction is rendered after its divider, unnumbered: the file's own title is
      // dropped and its headings sit one level below the part title.
      const blocks = md.parse(read(part.intro.file)).filter((b) => !(b.type === 'heading' && b.level === 1));
      for (const b of blocks) if (b.type === 'heading') { b.outLevel = b.level + 1; b.id = `${md.slug(part.title)}-${md.slug(b.text)}`; }
      part.introBlocks = blocks;
    }
    for (const ch of part.chapters) {
      n += 1;
      ch.number = n;
      ch.blocks = buildChapter(ch, n);
    }
  }
  fs.writeFileSync(OUT_HTML, pageHtml(parts));
  fs.writeFileSync(OUT_MD, pageMarkdown(parts));
  fs.writeFileSync(OUT_INDEX, indexHtml(parts));
  const kb = (p) => `${Math.round(fs.statSync(p).size / 1024)} KB`;
  for (const out of [OUT_INDEX, OUT_HTML, OUT_MD]) {
    console.log(`wrote ${path.relative(ROOT, out)} (${kb(out)})`);
  }
}

main();
