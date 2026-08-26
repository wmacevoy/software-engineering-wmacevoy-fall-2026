'use strict';

// Signing strings for every signature in the system.
//
// A signature covers an explicit, ordered, pipe-joined string rather than
// canonical JSON. Two JSON encoders that disagree about key order or number
// formatting produce signatures that fail for reasons nobody can see; there is
// nothing here to disagree about.
//
// The leading tag prevents a signature made in one context from verifying in
// another. Adding or reordering a field means a new tag — V-4 applied to the
// signing format itself.

const SEPARATOR = '|';

// The first entry in a chain has no predecessor. It uses this rather than an
// empty field, so that every signing string has the same shape.
const GENESIS_HASH = '0'.repeat(64);

// Milliseconds always present, always UTC, always Z. A timestamp written two
// ways is two different signing strings, so the format is part of the contract
// and not a formatting preference. `Date#toISOString` already produces exactly
// this, which is why `formatTimestamp` is a one-liner and still worth having:
// it names the requirement.
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

const formatTimestamp = (value) => new Date(value).toISOString();

const field = (name, value) => {
  const text = String(value);
  if (text.length === 0) {
    throw new Error(`signing field ${name} must not be empty`);
  }
  if (text.includes(SEPARATOR)) {
    // Without this, a value could shift the field boundaries and a signature
    // taken over one set of values would verify against a different set.
    throw new Error(`signing field ${name} must not contain ${SEPARATOR}: ${text}`);
  }
  return text;
};

const integer = (name, value) => {
  if (!Number.isInteger(value)) {
    throw new Error(`signing field ${name} must be an integer: ${value}`);
  }
  return String(value);
};

const timestamp = (name, value) => {
  const text = String(value);
  if (!TIMESTAMP.test(text)) {
    throw new Error(
      `signing field ${name} must be RFC 3339 with milliseconds and Z: ${text}`
    );
  }
  return text;
};

// S-8: covers the values a consumer acts on, plus a nonce so that a genuine
// past reading replayed later does not verify as current (F-6).
const readingV1 = (reading) =>
  [
    'reading.v1',
    integer('lot_id', reading.lot_id),
    integer('available', reading.available),
    integer('capacity', reading.capacity),
    timestamp('as_of', reading.as_of),
    field('nonce', reading.nonce),
  ].join(SEPARATOR);

// L-9: prev_hash is what makes removal or alteration detectable; the signature
// is what stops a compromised journal forging entries in a device's name.
const logEntryV1 = (entry) =>
  [
    'logentry.v1',
    integer('seq', entry.seq),
    timestamp('ts', entry.ts),
    field('device_id', entry.device_id),
    field('event', entry.event),
    field('prev_hash', entry.prev_hash),
    field('payload_sha256', entry.payload_sha256),
  ].join(SEPARATOR);

// G-2: the manifest is the signed object and the artifact is bound in by hash,
// which keeps the signed thing small and fixed-shape.
const manifestV1 = (manifest) =>
  [
    'manifest.v1',
    field('version', manifest.version),
    field('target', manifest.target),
    field('artifact_sha256', manifest.artifact_sha256),
    field('min_version', manifest.min_version),
    timestamp('expires_at', manifest.expires_at),
  ].join(SEPARATOR);

module.exports = {
  SEPARATOR,
  GENESIS_HASH,
  TIMESTAMP,
  formatTimestamp,
  readingV1,
  logEntryV1,
  manifestV1,
};
