'use strict';

const mongoose = require('mongoose');

/**
 * Connects mongoose to a throw-away database for integration tests.
 *  - MONGO_TEST_URI set  -> uses that MongoDB (the Docker setup points it at the compose "mongo" service).
 *    The database name must contain "test"; it is dropped before and after the run.
 *  - otherwise           -> starts mongodb-memory-server (downloads a mongod binary on first run).
 */
async function startTestDb() {
  let memory = null;
  let uri = process.env.MONGO_TEST_URI;

  if (uri) {
    const dbName = new URL(uri).pathname.replace('/', '');
    if (!dbName.includes('test')) {
      throw new Error(`Refusing to run tests against database "${dbName}": its name must contain "test"`);
    }
  } else {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memory = await MongoMemoryServer.create();
    uri = memory.getUri('ecoloop_test');
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  await mongoose.connection.dropDatabase();

  return {
    async stop() {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
      if (memory) await memory.stop();
    },
  };
}

module.exports = { startTestDb };
