const assert = require('assert');
const http = require('http');
const path = require('path');

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
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
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
// Note: We need to make sure we don't accidentally load the real models/index.js
// if it's required via a different path string that resolves to the same file.
// But node's require cache uses realpath, so it should be fine.

const app = require('../app');

// Create server
const server = http.createServer(app);

// Function to find a free port
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

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/this-route-does-not-exist-' + Date.now(),
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);

      try {
        assert.strictEqual(res.statusCode, 404, 'Response status code should be 404');
        console.log('Test passed: 404 handler works correctly.');
        res.resume(); // Consume response data to free up memory
        server.close();
        process.exit(0);
      } catch (e) {
        console.error('Test failed:', e.message);
        server.close();
        process.exit(1);
      }
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      server.close();
      process.exit(1);
    });

    req.end();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

runTest();
