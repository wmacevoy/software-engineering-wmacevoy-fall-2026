'use strict';

// The closed set of error codes (V-5). `code` is what callers branch on;
// `message` is for humans and is never parsed.
//
// Retryability is explicit rather than inferred from the status code (V-6),
// because the inference rules are exactly what people get wrong. Retrying an
// authorization failure forever is the standard version of that mistake.

const ERRORS = {
  malformed_request: { status: 400, retryable: false },
  invalid_lot_id: { status: 400, retryable: false },
  unauthenticated: { status: 401, retryable: false },
  forbidden: { status: 403, retryable: false },
  device_not_enrolled: { status: 403, retryable: false },
  device_revoked: { status: 403, retryable: false },
  lot_not_found: { status: 404, retryable: false },
  device_not_found: { status: 404, retryable: false },
  already_enrolled: { status: 409, retryable: false },
  version_not_supported: { status: 409, retryable: false },
  downgrade_refused: { status: 409, retryable: false },
  target_mismatch: { status: 409, retryable: false },
  manifest_expired: { status: 409, retryable: false },
  chain_broken: { status: 409, retryable: false },
  signature_invalid: { status: 422, retryable: false },
  reading_out_of_range: { status: 422, retryable: false },
  dependency_unavailable: { status: 503, retryable: true },
  upstream_timeout: { status: 504, retryable: true },
};

const isCode = (code) => Object.prototype.hasOwnProperty.call(ERRORS, code);

const statusFor = (code) => {
  if (!isCode(code)) throw new Error(`unknown error code: ${code}`);
  return ERRORS[code].status;
};

const isRetryable = (code) => {
  if (!isCode(code)) throw new Error(`unknown error code: ${code}`);
  return ERRORS[code].retryable;
};

// Building a body for an unknown code throws rather than inventing one. A
// typo'd code that reaches a caller is worse than a crash here: the caller
// branches on it and silently takes the wrong path.
const body = (code, message, traceId) => ({
  error: {
    code,
    message,
    retryable: isRetryable(code),
    trace_id: traceId,
  },
});

module.exports = { ERRORS, isCode, statusFor, isRetryable, body };
