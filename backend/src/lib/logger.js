'use strict';

const SENSITIVE_KEYS = /pass(word)?|hash|token|secret|authorization|qr|faceid|nationalid|criminalrecord/i;

/** Deep-copies a value, replacing the value of any sensitive-looking key. */
function redact(value, depth = 0) {
  if (depth > 6) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEYS.test(k) ? '***REDACTED***' : redact(v, depth + 1);
    }
    return out;
  }
  return value;
}

function write(level, message, meta) {
  if (process.env.NODE_ENV === 'test' && !process.env.LOG_IN_TESTS) return;
  const line = { level, time: new Date().toISOString(), message, ...(meta ? redact(meta) : {}) };
  const out = level === 'error' ? console.error : console.log;
  out(JSON.stringify(line));
}

module.exports = {
  redact,
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
