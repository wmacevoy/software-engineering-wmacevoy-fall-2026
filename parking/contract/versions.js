'use strict';

// V-1, V-3. Ordered oldest to newest; `negotiate` relies on that ordering.
const API_VERSIONS = ['v1'];

const CURRENT = API_VERSIONS[API_VERSIONS.length - 1];

// L-11. The log record schema versions independently of the API: a consumer of
// the records is not necessarily a caller of the endpoints.
const LOG_SCHEMA_VERSION = '1';

// V-3: a fleet of sensor containers cannot be upgraded atomically, so mixed
// versions are the normal condition. Pick the highest both sides speak, or
// null when there is no overlap — which is a refusal, not a fallback.
const negotiate = (peerVersions) => {
  if (!Array.isArray(peerVersions)) return null;
  const mutual = API_VERSIONS.filter((version) => peerVersions.includes(version));
  return mutual.length > 0 ? mutual[mutual.length - 1] : null;
};

module.exports = { API_VERSIONS, CURRENT, LOG_SCHEMA_VERSION, negotiate };
