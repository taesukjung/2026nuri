const assert = require('assert');
const http = require('http');
const path = require('path');
const express = require('express');

// Spy counters
let findAllCallCount = 0;
let countCallCount = 0;

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');
const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    Op: { like: 'like' },
    literal: (val) => val,
    import: () => {}
  },
  Sequelize: {
    Op: { like: 'like' }
  },
  tbl_bbs: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => {
        countCallCount++;
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCallCount++;
        return Promise.resolve([]);
    },
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_auth: {
     findOne: () => Promise.resolve({})
  }
};

// Inject mock into require cache
require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels
};

// Require app
const app = require('../app');

// Create server
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

    // Data for POST request
    const postData = JSON.stringify({
      b_category: '1',
      b_date: '2023-01-01',
      b_sector: '1',
      b_client: 'TestClient',
      b_text: 'TestText'
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
      // Consume response
      res.on('data', () => {});
      res.on('end', () => {
        console.log(`tbl_ref.findAll called: ${findAllCallCount}`);
        console.log(`tbl_ref.count called: ${countCallCount}`);

        server.close();

        if (findAllCallCount > 0 || countCallCount > 0) {
            console.log(`FAILURE: tbl_ref.findAll called: ${findAllCallCount}, tbl_ref.count called: ${countCallCount}`);
            process.exit(1);
        } else {
            console.log("SUCCESS: tbl_ref.findAll and tbl_ref.count were NOT called.");
            process.exit(0);
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

runTest();
