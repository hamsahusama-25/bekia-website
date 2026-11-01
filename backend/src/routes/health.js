'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { ok } = require('../lib/respond');

const router = express.Router();

// 200 when the API and MongoDB are reachable, 503 otherwise (used by the Docker healthcheck).
router.get('/', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  const body = { status: dbUp ? 'UP' : 'DOWN', db: dbUp ? 'connected' : 'disconnected' };
  if (dbUp) return ok(req, res, body);
  return res.status(503).json({ success: false, requestId: req.requestId, data: body, error: { code: 'DB_UNAVAILABLE', message: 'Database is not connected' } });
});

module.exports = router;
