'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const signing = require('./signing');

const READING = {
  lot_id: 3,
  available: 84,
  capacity: 120,
  as_of: '2026-08-26T14:03:11.204Z',
  nonce: 'b3f1a29c',
};

test('S-8: a reading signs an ordered, tagged, pipe-joined string', () => {
  assert.equal(
    signing.readingV1(READING),
    'reading.v1|3|84|120|2026-08-26T14:03:11.204Z|b3f1a29c'
  );
});

test('S-8: a field containing the separator is refused', () => {
  // Otherwise a value could shift the field boundaries: a signature taken over
  // one set of values would verify against a different set.
  assert.throws(
    () => signing.readingV1({ ...READING, nonce: 'b3f1|999|120' }),
    /must not contain \|/
  );
});

test('S-8: an empty field is refused', () => {
  assert.throws(() => signing.readingV1({ ...READING, nonce: '' }), /must not be empty/);
});

test('S-1: non-integer counts are refused before they can be signed', () => {
  assert.throws(() => signing.readingV1({ ...READING, available: 84.5 }), /must be an integer/);
  assert.throws(() => signing.readingV1({ ...READING, available: '84' }), /must be an integer/);
});

test('S-2: a timestamp without milliseconds is refused', () => {
  // Two spellings of the same instant are two different signing strings, so the
  // format is part of the contract rather than a formatting preference.
  assert.throws(
    () => signing.readingV1({ ...READING, as_of: '2026-08-26T14:03:11Z' }),
    /RFC 3339 with milliseconds/
  );
});

test('S-2: formatTimestamp produces the one accepted spelling', () => {
  const text = signing.formatTimestamp('2026-08-26T14:03:11Z');
  assert.match(text, signing.TIMESTAMP);
  assert.equal(text, '2026-08-26T14:03:11.000Z');
});

test('F-6: the context tag stops a signature being replayed in another context', () => {
  const entry = {
    seq: 3,
    ts: '2026-08-26T14:03:11.204Z',
    device_id: 'snr-north',
    event: 'reading.served',
    prev_hash: signing.GENESIS_HASH,
    payload_sha256: 'a'.repeat(64),
  };
  const reading = signing.readingV1(READING);
  const log = signing.logEntryV1(entry);
  assert.notEqual(reading, log);
  assert.ok(reading.startsWith('reading.v1|'));
  assert.ok(log.startsWith('logentry.v1|'));
});

test('L-9: the first entry in a chain uses a genesis hash, not an empty field', () => {
  assert.equal(signing.GENESIS_HASH.length, 64);
  assert.match(signing.GENESIS_HASH, /^[0-9a-f]{64}$/);
});

test('G-2: a manifest signs the fields the refusal checks depend on', () => {
  assert.equal(
    signing.manifestV1({
      version: '1.4.0',
      target: 'sensor-alpine',
      artifact_sha256: 'c'.repeat(64),
      min_version: '1.0.0',
      expires_at: '2026-12-01T00:00:00.000Z',
    }),
    `manifest.v1|1.4.0|sensor-alpine|${'c'.repeat(64)}|1.0.0|2026-12-01T00:00:00.000Z`
  );
});
