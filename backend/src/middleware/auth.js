'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { Collector } = require('../models');
const { unauthorized, forbidden } = require('../lib/errors');

function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  });
}

/**
 * Verifies the Bearer token, then checks the role (if any roles are listed).
 * 401 = missing/invalid token, 403 = valid token but wrong role.
 */
const requireAuth = (...allowedRoles) => (req, res, next) => {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) throw unauthorized('UNAUTHORIZED');

  let payload;
  try {
    payload = jwt.verify(header.slice(7), config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    throw unauthorized('INVALID_TOKEN', 'Invalid or expired token');
  }

  if (allowedRoles.length && !allowedRoles.includes(payload.role)) throw forbidden('FORBIDDEN_ROLE');
  req.user = payload;
  next();
};

/** Collector routes: the collector must exist and be approved by an admin. */
async function requireApprovedCollector(req, res, next) {
  const collector = await Collector.findOne({ userId: req.user.sub });
  if (!collector) throw forbidden('COLLECTOR_PROFILE_MISSING');
  if (!collector.isApprovedByAdmin) throw forbidden('COLLECTOR_NOT_APPROVED', 'Waiting for admin approval');
  req.collector = collector;
  next();
}

module.exports = { signToken, requireAuth, requireApprovedCollector };
