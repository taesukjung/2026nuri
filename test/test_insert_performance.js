const assert = require('assert');
const app = require('../app');

async function runTest() {
  console.log('Starting /insert performance test...');

  // Start server
  const server = app.listen(0);
  const port = server.address().port;

  // Mock models to track if count and findAll are called
  const modelsPath = require.resolve('../models');
  let countCalled = false;
  let findAllCalled = false;
  let createCalled = false;

  const originalModels = require(modelsPath);

  // Override the models in the require cache
  require.cache[modelsPath].exports = {
    ...originalModels,
    tbl_ref: {
      ...originalModels.tbl_ref,
      create: async (options) => {
        createCalled = true;
        return { id: 1 };
      },
      count: async (options, callback) => {
        countCalled = true;
        if (callback) callback(1);
        return 1;
      },
      findAll: async (options) => {
        findAllCalled = true;
        return [{ id: 1 }];
      }
    },
    tbl_bbs: {
      ...originalModels.tbl_bbs,
      create: async (options) => {
        createCalled = true;
        return { id: 1 };
      },
      count: async (options, callback) => {
        countCalled = true;
        if (callback) callback(1);
        return 1;
      },
      findAll: async (options) => {
        findAllCalled = true;
        return [{ id: 1 }];
      }
    }
  };

  try {
    // Send request to /ref/insert
    console.log('Testing /ref/insert...');
    const refResponse = await fetch(`http://localhost:${port}/ref/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        b_category: 1,
        b_date: '2023',
        b_sector: 1,
        b_client: 'Test Client',
        b_text: 'Test Text'
      })
    });

    // Check if the old slow method was used
    assert.strictEqual(countCalled, false, 'count should not be called in /ref/insert');
    assert.strictEqual(findAllCalled, false, 'findAll should not be called in /ref/insert');

    countCalled = false; // reset
    findAllCalled = false;

    console.log('Testing /bbs/insert...');
    const bbsResponse = await fetch(`http://localhost:${port}/bbs/insert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        b_category: 1,
        b_date: '2023-10-27',
        b_subject: 'Test Subject',
        b_text: 'Test Text'
      })
    });

    // Check if the old slow method was used
    assert.strictEqual(countCalled, false, 'count should not be called in /bbs/insert');

    console.log('/insert performance test passed.');
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
