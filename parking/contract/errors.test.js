'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const errors = require('./errors');

test('V-5: every code carries a status and a retryability', () => {
  for (const [code, entry] of Object.entries(errors.ERRORS)) {
    assert.equal(typeof entry.status, 'number', `${code} status`);
    assert.equal(typeof entry.retryable, 'boolean', `${code} retryable`);
    assert.ok(entry.status >= 400 && entry.status < 600, `${code} status range`);
  }
});

test('V-6: only genuinely transient conditions are retryable', () => {
  // Retrying an authorization failure forever is the standard way to get this
  // wrong, so the set is asserted exactly rather than spot-checked.
  const retryable = Object.entries(errors.ERRORS)
    .filter(([, entry]) => entry.retryable)
    .map(([code]) => code)
    .sort();
  assert.deepEqual(retryable, ['dependency_unavailable', 'upstream_timeout']);
});

test('V-6: no 4xx is retryable', () => {
  for (const [code, entry] of Object.entries(errors.ERRORS)) {
    if (entry.status < 500) {
      assert.equal(entry.retryable, false, `${code} is 4xx and must not be retryable`);
    }
  }
});

test('V-5: an unknown code throws rather than inventing an envelope', () => {
  // A typo that reaches a caller is worse than a crash here: the caller
  // branches on the code and silently takes the wrong path.
  assert.throws(() => errors.body('teapot', 'nope'), /unknown error code/);
  assert.throws(() => errors.statusFor('teapot'), /unknown error code/);
});

test('V-5: the envelope carries retryability from the table, not from the caller', () => {
  const body = errors.body('upstream_timeout', 'sensor did not answer', 'trace-1');
  assert.deepEqual(body, {
    error: {
      code: 'upstream_timeout',
      message: 'sensor did not answer',
      retryable: true,
      trace_id: 'trace-1',
    },
  });
  assert.equal(errors.body('forbidden', 'no').error.retryable, false);
});

test('C-5, C-7: the codes the collector needs for rejection exist', () => {
  assert.ok(errors.isCode('reading_out_of_range'));
  assert.ok(errors.isCode('signature_invalid'));
  assert.ok(errors.isCode('device_revoked'));
});
