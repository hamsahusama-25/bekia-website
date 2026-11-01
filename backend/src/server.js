'use strict';

const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./lib/logger');
const { createApp } = require('./app');

async function main() {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
  logger.info('mongodb connected');

  const server = createApp().listen(config.port, () => logger.info('api listening', { port: config.port }));

  const shutdown = async (signal) => {
    logger.info('shutting down', { signal });
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('startup failed', { error: err.message });
  process.exit(1);
});
