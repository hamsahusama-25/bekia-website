'use strict';

const multer = require('multer');
const config = require('../config');

// Files are kept in memory, validated by magic bytes, then written by lib/files.js.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 3, fields: 10 },
});

module.exports = upload;
