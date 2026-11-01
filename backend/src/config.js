'use strict';

const path = require('node:path');

const env = process.env.NODE_ENV || 'development';

function jwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (env === 'test') return 'test-secret-not-for-production';
  throw new Error('JWT_SECRET is required. Copy .env.example to .env and set it.');
}

module.exports = {
  env,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecoloop',
  jwtSecret: jwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  bcryptCost: env === 'test' ? 4 : 10,
  appTimeZone: process.env.APP_TZ || 'Africa/Cairo',
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
  maxUploadBytes: 5 * 1024 * 1024,
  // Number of reverse proxies in front of the API (1 = the Next.js container). Needed so the
  // rate limiter sees the real client IP. Only enable it if port 5000 is not publicly reachable.
  trustProxy: Number(process.env.TRUST_PROXY || 0),

  // Business rules (documented in docs/00-first-user-journey.md)
  noShowMaxMeters: 500,
  pointsPerKg: 10,
  targetBonusPoints: 200,
  silverAtRatio: 1.0,
  goldAtRatio: 1.5,
};
