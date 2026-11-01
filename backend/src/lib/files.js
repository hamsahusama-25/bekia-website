'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('../config');
const { badRequest } = require('./errors');

const SIGNATURES = [
  { ext: 'jpg', test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'png', test: (b) => b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: 'webp', test: (b) => b.length > 12 && b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP' },
];

const STORED_NAME = /^[a-f0-9]{32}\.(jpg|png|webp)$/;

/** Detects the real image type from magic bytes (the client-sent mimetype is not trusted). */
function detectImageExt(buffer) {
  const hit = SIGNATURES.find((s) => s.test(buffer));
  return hit ? hit.ext : null;
}

/** Validates and stores an uploaded image; returns the stored file name. */
async function saveImage(buffer) {
  const ext = detectImageExt(buffer);
  if (!ext) throw badRequest('INVALID_IMAGE', 'Only JPEG, PNG or WebP images are accepted');
  const name = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  await fs.mkdir(config.uploadDir, { recursive: true });
  await fs.writeFile(path.join(config.uploadDir, name), buffer, { flag: 'wx' });
  return name;
}

function resolveStoredFile(name) {
  if (!STORED_NAME.test(name)) return null; // blocks path traversal
  return path.join(config.uploadDir, name);
}

module.exports = { saveImage, resolveStoredFile, detectImageExt };
