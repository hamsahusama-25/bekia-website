'use strict';

const express = require('express');
const config = require('./config');
const helmet = require('helmet');
const requestContext = require('./middleware/requestContext');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

/** Builds the Express app. It does not open a database connection (see server.js). */
function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);
  app.use(helmet());
  app.use(requestContext);
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', require('./routes/health'));
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/packages', require('./routes/packages'));
  app.use('/api/company', require('./routes/company'));
  app.use('/api/collector', require('./routes/collector'));
  app.use('/api/pickups', require('./routes/pickups'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/files', require('./routes/files'));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
