'use strict';

// Inline SVG figures for the field guide. Each uses currentColor and the page's CSS variables so it
// follows the light and dark themes without a second copy. Coordinates are in a fixed viewBox; the
// stylesheet scales the drawing to the column.

const FONT = 'font-family="var(--sans)"';

function step(x, top, k, name, cost, hot) {
  const h = 250 - top;
  const fill = hot ? 'var(--amber-soft)' : 'var(--surface)';
  const stroke = hot ? 'var(--amber)' : 'currentColor';
  const sw = hot ? 2 : 1.4;
  const cx = x + 70;
  return `
    <rect x="${x}" y="${top}" width="140" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <text x="${cx}" y="${top + 24}" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" ${FONT}>${k}</text>
    <text x="${cx}" y="${top + 42}" text-anchor="middle" font-size="11" fill="currentColor" ${FONT}>${name}</text>
    <text x="${cx}" y="${top + 62}" text-anchor="middle" font-size="10.5" font-style="italic" fill="currentColor" opacity=".75" ${FONT}>${cost}</text>`;
}

const ladder = `
<svg viewBox="0 0 900 300" role="img" aria-label="Four steps rise from left to right, K0 the known through K3 erroneous certainty, each more expensive to discover than the last. K4, a falsehood kept on purpose, stands apart from the ladder.">
  <defs>
    <marker id="ld-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  ${step(40, 170, 'K0', 'the known', 'look it up', false)}
  ${step(200, 125, 'K1', 'the known unknown', 'research it', false)}
  ${step(360, 80, 'K2', 'the unknown unknown', 'a rewrite', false)}
  ${step(520, 30, 'K3', 'erroneous certainty', 'whatever was built on it', true)}
  <line x1="30" y1="250" x2="690" y2="250" stroke="currentColor" stroke-width="1.4" marker-end="url(#ld-arrow)"/>
  <text x="360" y="272" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".75" ${FONT}>cost of finding out which one it was</text>
  <rect x="712" y="100" width="166" height="112" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
  <text x="795" y="128" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor" ${FONT}>K4</text>
  <text x="795" y="146" text-anchor="middle" font-size="10.5" fill="currentColor" ${FONT}>a falsehood kept on purpose</text>
  <text x="795" y="166" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".8" ${FONT}>named, recorded,</text>
  <text x="795" y="180" text-anchor="middle" font-size="10.5" fill="currentColor" opacity=".8" ${FONT}>blast radius known</text>
  <text x="795" y="201" text-anchor="middle" font-size="9.5" letter-spacing=".05em" fill="var(--accent)" ${FONT}>NOT ON THE LADDER</text>
</svg>`;

const gradient = `
<svg viewBox="0 0 900 320" role="img" aria-label="A curve of fear against time that stays nearly flat and then rises steeply at the deadline. A second curve, with three dashed fences marked demo, deploy, and conformance run, rises only a little before each fence and settles again.">
  <defs>
    <marker id="gr-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <line x1="60" y1="260" x2="870" y2="260" stroke="currentColor" stroke-width="1.4" marker-end="url(#gr-arrow)"/>
  <line x1="60" y1="260" x2="60" y2="36" stroke="currentColor" stroke-width="1.4" marker-end="url(#gr-arrow)"/>
  <text x="66" y="282" font-size="10.5" fill="currentColor" opacity=".75" ${FONT}>start</text>
  <text x="858" y="282" text-anchor="end" font-size="10.5" fill="currentColor" opacity=".75" ${FONT}>the deadline</text>
  <text x="70" y="44" font-size="10.5" fill="currentColor" opacity=".75" ${FONT}>fear</text>

  <g stroke="var(--accent)" stroke-width="1.2" stroke-dasharray="4 4">
    <line x1="260" y1="62" x2="260" y2="260"/>
    <line x1="460" y1="62" x2="460" y2="260"/>
    <line x1="660" y1="62" x2="660" y2="260"/>
  </g>
  <g font-size="10" fill="var(--accent)" text-anchor="middle" ${FONT}>
    <text x="260" y="54">demo</text>
    <text x="460" y="54">deploy</text>
    <text x="660" y="54">conformance run</text>
  </g>

  <path d="M60,249 L160,247 L260,245 L360,242 L460,239 L560,232 L660,221 L720,209 L760,195 L790,179 L810,162 L825,144 L835,128 L843,112 L849,97 L853,85 L856,75 L858,68"
        fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <text x="648" y="204" text-anchor="end" font-size="10.5" fill="currentColor" ${FONT}>one deadline, no fences</text>

  <path d="M60,256 Q180,254 256,238 L262,256 Q380,254 456,238 L462,256 Q580,254 656,238 L662,256 Q770,250 858,214"
        fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linecap="round"/>
  <text x="66" y="234" font-size="10.5" fill="var(--accent)" ${FONT}>with fences that prove something</text>
</svg>`;

function box(x, y, w, h, title, sub, hot) {
  const fill = hot ? 'var(--accent-soft)' : 'var(--surface)';
  const stroke = hot ? 'var(--accent)' : 'currentColor';
  const sw = hot ? 2.2 : 1.4;
  const cx = x + w / 2;
  const ty = sub ? y + h / 2 - 3 : y + h / 2 + 5;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <text x="${cx}" y="${ty}" text-anchor="middle" font-size="12.5" font-weight="700" fill="currentColor" ${FONT}>${title}</text>
    ${sub ? `<text x="${cx}" y="${ty + 17}" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" ${FONT}>${sub}</text>` : ''}`;
}

function arrow(x1, y1, x2, y2, label, lx, ly, dashed, anchor = 'middle') {
  const dash = dashed ? ' stroke-dasharray="4 4"' : '';
  return `
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" stroke-width="1.6"${dash} marker-end="url(#sh-arrow)"/>
    ${label ? `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="10" fill="currentColor" opacity=".75" ${FONT}>${label}</text>` : ''}`;
}

const shape = `
<svg viewBox="0 0 900 360" role="img" aria-label="Sensors, one per lot, are polled over HTTP by the collector, which writes to Postgres, which the web app reads to serve a driver. A shared NTP source feeds time to sensors and collector. Sensors and the collector append to an aggregator, an append-only log, which the ops UI reads.">
  <defs>
    <marker id="sh-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  ${box(400, 24, 100, 44, 'NTP', 'shared, faultable', false)}
  ${box(40, 150, 160, 70, 'sensors', 'one per lot · the designated liar', false)}
  ${box(300, 150, 150, 70, 'collector', 'poll · verify · derive', true)}
  ${box(510, 150, 126, 70, 'Postgres', 'lots, devices, readings', false)}
  ${box(680, 150, 100, 70, 'web app', 'driver UI · ops UI', false)}
  <text x="822" y="190" font-size="12.5" font-weight="700" fill="currentColor" ${FONT}>driver</text>
  ${box(300, 280, 150, 60, 'aggregator', 'append-only log', false)}
  ${box(520, 280, 110, 60, 'ops UI', '', false)}

  ${arrow(418, 70, 140, 146, 'time', 262, 96, true)}
  ${arrow(455, 70, 395, 146, 'time', 440, 112, true, 'start')}
  ${arrow(202, 185, 296, 185, 'poll (HTTP)', 249, 172, false)}
  ${arrow(452, 185, 506, 185, 'write', 479, 172, false)}
  ${arrow(638, 185, 676, 185, 'read', 657, 172, false)}
  ${arrow(782, 185, 816, 185, '', 0, 0, false)}
  <polyline points="120,222 120,310 296,310" fill="none" stroke="currentColor" stroke-width="1.6" marker-end="url(#sh-arrow)"/>
  <text x="200" y="300" text-anchor="middle" font-size="10" fill="currentColor" opacity=".75" ${FONT}>append</text>
  ${arrow(375, 222, 375, 276, 'append', 384, 254, false, 'start')}
  ${arrow(452, 310, 516, 310, 'read', 484, 300, false)}
</svg>`;

function cell(x, y, w, h, letter, name, note, hot) {
  const fill = hot ? 'var(--amber-soft)' : 'var(--surface)';
  const stroke = hot ? 'var(--amber)' : 'currentColor';
  const sw = hot ? 2 : 1.2;
  const op = hot ? 1 : 0.55;
  return `
    <g opacity="${op}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <text x="${x + 10}" y="${y + 27}" font-size="15" font-weight="700" fill="currentColor" ${FONT}>${letter}</text>
      <text x="${x + 10}" y="${y + 45}" font-size="10.5" fill="currentColor" ${FONT}>${name}</text>
      <text x="${x + 10}" y="${y + 64}" font-size="9" font-style="italic" fill="currentColor" opacity=".85" ${FONT}>${note}</text>
    </g>`;
}

const sections = [
  ['E', 'Operating envelope', 'a write budget, a new peak', true],
  ['S', 'The sensor', 'available, guarded', true],
  ['N', 'Time', 'expiry is customer-visible', true],
  ['I', 'Identity', 'a fifth identity', true],
  ['V', 'Versioning', 'a breaking change', true],
  ['G', 'Firmware', 'unchanged', false],
  ['A', 'Access control', 'a driver row', true],
  ['C', 'The collector', 'unchanged', false],
  ['L', 'Logging', 'personal data in the log', true],
  ['F', 'Faults and attacks', 'a second liar', true],
  ['U', 'The driver', 'a fourth case', true],
  ['T', 'Testing', 'an injectable clock', true],
];

const blast = `
<svg viewBox="0 0 900 350" role="img" aria-label="Twelve boxes for the lettered requirement sections, ten of them highlighted as touched by the VIP sentence, plus three wider boxes for scope decisions, non-goals, and the glossary, all three highlighted.">
  ${sections
    .map(([letter, name, note, hot], i) => cell(34 + 142 * (i % 6), 16 + 100 * Math.floor(i / 6), 136, 82, letter, name, note, hot))
    .join('')}
  ${cell(40, 216, 260, 70, 'Scope decisions', 'recorded so they would not be relitigated', 'three reopened', true)}
  ${cell(325, 216, 260, 70, 'Non-goals', '"Reservations, payment, or enforcement"', 'the grep hit', true)}
  ${cell(610, 216, 260, 70, 'Glossary', 'which did not exist yet', 'three new nouns', true)}
  <rect x="40" y="318" width="12" height="12" rx="2" fill="var(--amber-soft)" stroke="var(--amber)" stroke-width="1.5"/>
  <text x="60" y="328" font-size="10.5" fill="currentColor" ${FONT}>touched by one sentence about two hundred spaces</text>
  <rect x="380" y="318" width="12" height="12" rx="2" fill="var(--surface)" stroke="currentColor" stroke-width="1" opacity=".55"/>
  <text x="400" y="328" font-size="10.5" fill="currentColor" opacity=".7" ${FONT}>unchanged</text>
</svg>`;

module.exports = { ladder, gradient, shape, blast };
