const assert = require('assert');
const http = require('http');
const path = require('path');
const express = require('express');

// Mock data
let findAllCalled = false;
let createCalled = false;

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    literal: (val) => val,
    import: () => {},
    Op: { like: 'like' }
  },
  Sequelize: {
    Op: { like: 'like' }
  },
  tbl_ref: {
    create: (data) => {
        createCalled = true;
        return Promise.resolve({ id: 1, ...data });
    },
    count: (options, cb) => {
        if (cb) cb(0);
        return Promise.resolve(0);
    },
    findAll: (options) => {
        findAllCalled = true;
        console.log('tbl_ref.findAll was called!');
        return Promise.resolve([]);
    },
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  // Mock other models to avoid crashes if they are loaded
  tbl_bbs: { findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }) },
  tbl_auth: { findOne: () => Promise.resolve({}) }
};

// Inject mock into require cache
require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels
};

// We need to mock express-paginate because it's used in refController
// But usually real express-paginate is fine. Let's try without mocking it first.
// If it fails, we can mock it.

// Load the app
// We need to catch potential errors if other modules fail to load
let app;
try {
    app = require('../app');
} catch (err) {
    console.error('Failed to load app.js:', err);
    process.exit(1);
}

const server = http.createServer(app);

function listenOnFreePort(server) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      resolve(port);
    });
    server.on('error', reject);
  });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    // Prepare POST data
    const postData = JSON.stringify({
      b_category: 'test',
      b_date: '2023-10-27',
      b_sector: '1',
      b_client: 'Test Client',
      b_text: 'Test Text'
    });

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/ref/insert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Response body:', data);

        try {
            // Check if create was called
            assert.strictEqual(createCalled, true, 'tbl_ref.create should have been called');

            // Check if findAll was called (This is the behavior we want to verify and then fix)
            // We expect findAllCalled to be false, proving the optimization.
            assert.strictEqual(findAllCalled, false, 'tbl_ref.findAll should NOT be called after optimization');
            console.log('SUCCESS: findAll was NOT called (Optimization verified).');

            server.close();
            process.exit(0);
        } catch (e) {
            console.error('Test failed:', e.message);
            server.close();
            process.exit(1);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      server.close();
      process.exit(1);
    });

    req.write(postData);
    req.end();

  } catch (error) {
    console.error('Test execution error:', error);
    if (server) server.close();
    process.exit(1);
  }
}

runTest();
