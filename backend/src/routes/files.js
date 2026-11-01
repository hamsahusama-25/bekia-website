'use strict';

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { resolveStoredFile } = require('../lib/files');
const { notFound } = require('../lib/errors');

const router = express.Router();

// ID documents and scale photos are private: only admins can open them, and only by generated name.
router.get('/:name', requireAuth('admin'), (req, res, next) => {
  const file = resolveStoredFile(req.params.name);
  if (!file) return next(notFound('FILE_NOT_FOUND'));
  res.set('Cache-Control', 'private, no-store');
  return res.sendFile(file, (err) => {
    if (err) next(notFound('FILE_NOT_FOUND'));
  });
});

module.exports = router;
