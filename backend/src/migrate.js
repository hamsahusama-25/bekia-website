'use strict';

/**
 * "Migration" step for this MVP.
 * MongoDB has no table schema to migrate, so the migration is making sure every index exists:
 * the unique indexes and the 2dsphere index that $geoNear needs. It is safe to run repeatedly.
 */
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./lib/logger');
const models = require('./models');

async function runMigrations() {
  for (const [name, model] of Object.entries(models)) {
    await model.syncIndexes();
    logger.info('indexes synced', { model: name });
  }
}

module.exports = { runMigrations };

if (require.main === module) {
  (async () => {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
    await runMigrations();
    await mongoose.disconnect();
  })().catch((err) => {
    logger.error('migration failed', { error: err.message });
    process.exit(1);
  });
}
