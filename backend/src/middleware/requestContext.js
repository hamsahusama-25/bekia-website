'use strict';

const crypto = require('node:crypto');
const logger = require('../lib/logger');

const SAFE_ID = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Attaches a request id (X-Request-Id) and writes one access-log line per request.
 * Bodies and query strings are never logged: they can hold passwords, QR tokens and coordinates.
 */
function requestContext(req, res, next) {
  const incoming = req.get('x-request-id');
  req.requestId = incoming && SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);

  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    logger.info('request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl.split('?')[0],
      status: res.statusCode,
      ms: Number((process.hrtime.bigint() - startedAt) / 1000000n),
      userId: req.user ? req.user.sub : undefined,
    });
  });
  next();
}

module.exports = requestContext;
