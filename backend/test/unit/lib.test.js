'use strict';

require('../helpers/env');
const test = require('node:test');
const assert = require('node:assert/strict');
const { redact } = require('../../src/lib/logger');
const { detectImageExt, resolveStoredFile } = require('../../src/lib/files');
const { todayLocal, monthKey, addMonths } = require('../../src/lib/dates');

test('redact: masks passwords, tokens, QR and documents, keeps normal fields', () => {
  const out = redact({
    fullname: 'Ahmed',
    password: 'secret123',
    nested: { qrToken: 'abc', authorization: 'Bearer x', passwordHash: 'h', faceId: 'f.jpg', ok: 1 },
    list: [{ token: 't' }],
  });
  assert.equal(out.fullname, 'Ahmed');
  assert.equal(out.password, '***REDACTED***');
  assert.equal(out.nested.qrToken, '***REDACTED***');
  assert.equal(out.nested.authorization, '***REDACTED***');
  assert.equal(out.nested.passwordHash, '***REDACTED***');
  assert.equal(out.nested.faceId, '***REDACTED***');
  assert.equal(out.nested.ok, 1);
  assert.equal(out.list[0].token, '***REDACTED***');
});

test('redact: does not mutate the input', () => {
  const input = { password: 'x' };
  redact(input);
  assert.equal(input.password, 'x');
});

test('images: detects real formats by magic bytes and rejects everything else', () => {
  assert.equal(detectImageExt(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0])), 'jpg');
  assert.equal(detectImageExt(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0])), 'png');
  assert.equal(detectImageExt(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1')), 'webp');
  assert.equal(detectImageExt(Buffer.from('<script>alert(1)</script>')), null);
  assert.equal(detectImageExt(Buffer.alloc(0)), null);
});

test('files: stored names must be 32 hex chars + allowed extension (blocks path traversal)', () => {
  assert.equal(resolveStoredFile('../../etc/passwd'), null);
  assert.equal(resolveStoredFile('..%2f..%2fetc%2fpasswd'), null);
  assert.equal(resolveStoredFile('seed-demo'), null);
  assert.ok(resolveStoredFile('0123456789abcdef0123456789abcdef.jpg'));
});

test('dates: business-timezone day and month keys', () => {
  // 22:30 UTC on 31 Oct is already 1 Nov in Cairo (UTC+2)
  const d = new Date('2026-10-31T22:30:00Z');
  assert.equal(todayLocal(d, 'Africa/Cairo'), '2026-11-01');
  assert.equal(monthKey(d, 'Africa/Cairo'), '2026-11');
  assert.equal(monthKey(d, 'UTC'), '2026-10');
});

test('dates: addMonths clamps to the last day of the month', () => {
  assert.equal(addMonths(new Date('2026-08-31T00:00:00Z'), 6).toISOString().slice(0, 10), '2027-02-28');
  assert.equal(addMonths(new Date('2026-11-01T00:00:00Z'), 12).toISOString().slice(0, 10), '2027-11-01');
});
