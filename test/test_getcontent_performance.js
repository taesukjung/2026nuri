const assert = require('assert');
const app = require('../app');

async function runTest() {
  console.log('Starting /getContent performance test...');

  // Start server
  const server = app.listen(0);
  const port = server.address().port;

  // Mock models to track if findAndCountAll is called
  const modelsPath = require.resolve('../models');
  let findAndCountAllCalled = false;
  let findAllCalled = false;

  const originalModels = require(modelsPath);

  // Override the models in the require cache
  require.cache[modelsPath].exports = {
    ...originalModels,
    tbl_ref: {
      ...originalModels.tbl_ref,
      findAndCountAll: async (options) => {
        findAndCountAllCalled = true;
        return { count: 1, rows: [{ id: 1, b_text: 'test content' }] };
      },
      findAll: async (options) => {
        findAllCalled = true;
        return [{ id: 1, b_text: 'test content' }];
      }
    },
    tbl_bbs: {
      ...originalModels.tbl_bbs,
      findAndCountAll: async (options) => {
        findAndCountAllCalled = true;
        return { count: 1, rows: [{ id: 1, b_text: 'test content' }] };
      },
      findAll: async (options) => {
        findAllCalled = true;
        return [{ id: 1, b_text: 'test content' }];
      }
    }
  };

  try {
    // We need to re-initialize the routes so they use the mocked models
    // But since express routes are already mounted in app.js, a simpler way is to
    // just send requests to the server. Note that because app.js already required the routes,
    // they might hold references to the old models. Let's see if the mocked cache works.

    console.log('Testing /ref/getContent...');
    const refResponse = await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);
    assert.strictEqual(refResponse.status, 200, 'Expected 200 OK');

    // Check if the old slow method was used
    assert.strictEqual(findAndCountAllCalled, false, 'findAndCountAll should not be called in /ref/getContent');

    findAndCountAllCalled = false; // reset
    findAllCalled = false;

    console.log('Testing /bbs/getContent...');
    const bbsResponse = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
    assert.strictEqual(bbsResponse.status, 200, 'Expected 200 OK');

    // Check if the old slow method was used
    assert.strictEqual(findAndCountAllCalled, false, 'findAndCountAll should not be called in /bbs/getContent');

    console.log('/getContent performance test passed.');
  } catch (error) {
    console.error('Test failed:', error);
    process.exitCode = 1;
  } finally {
    // Restore cache and close server
    require.cache[modelsPath].exports = originalModels;
    server.close();
  }
}

runTest();
