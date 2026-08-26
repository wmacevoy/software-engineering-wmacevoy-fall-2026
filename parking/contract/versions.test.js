'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const versions = require('./versions');

test('V-3: negotiation picks the highest version both sides speak', () => {
  assert.equal(versions.negotiate(['v1']), 'v1');
  assert.equal(versions.negotiate(['v1', 'v99']), 'v1');
});

test('V-3: no overlap is a refusal, not a fallback', () => {
  // A fleet cannot be upgraded atomically, so mixed versions are ordinary. A
  // sensor speaking nothing we speak is different, and silently guessing a
  // version is how you get a wrong answer instead of an error.
  assert.equal(versions.negotiate(['v99']), null);
  assert.equal(versions.negotiate([]), null);
  assert.equal(versions.negotiate(undefined), null);
});

test('V-1: the version list is ordered oldest to newest', () => {
  // negotiate() takes the last mutual entry, so the ordering is load-bearing.
  const sorted = [...versions.API_VERSIONS].sort(
    (a, b) => Number(a.slice(1)) - Number(b.slice(1))
  );
  assert.deepEqual(versions.API_VERSIONS, sorted);
  assert.equal(versions.CURRENT, versions.API_VERSIONS[versions.API_VERSIONS.length - 1]);
});
