'use strict';

// Must be required before anything from src/, so config.js sees the test settings.
const os = require('node:os');
const path = require('node:path');
const fs = require('node:fs');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-for-production';
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ecoloop-uploads-'));
