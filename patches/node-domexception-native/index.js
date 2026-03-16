'use strict';
// Stub to replace deprecated node-domexception: use Node 18+ native DOMException.
// See: https://github.com/node-fetch/fetch-blob/issues/175
module.exports = globalThis.DOMException;
