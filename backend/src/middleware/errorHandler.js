'use strict';

const { ZodError } = require('zod');
const multer = require('multer');
const logger = require('../lib/logger');
const { AppError } = require('../lib/errors');

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    requestId: req.requestId,
    error: { code: 'ROUTE_NOT_FOUND', message: 'Route not found' },
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof AppError) {
    ({ status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid request data';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    code = err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR';
    message = 'Upload rejected';
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400;
    code = 'INVALID_JSON';
    message = 'Request body is not valid JSON';
  } else if (err && err.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'A record with the same unique value already exists';
  } else if (err && err.name === 'CastError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid identifier';
  }

  if (status >= 500) {
    logger.error('unhandled error', { requestId: req.requestId, error: err && err.stack });
  }

  res.status(status).json({
    success: false,
    requestId: req.requestId,
    error: { code, message, ...(details ? { details } : {}) },
  });
}

module.exports = { notFoundHandler, errorHandler };
