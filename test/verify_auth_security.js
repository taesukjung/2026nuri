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

const app = require('../app');
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

    // Test 1: POST /ref/insert without session
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/ref/insert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);

      try {
        if (res.statusCode === 401) {
            console.log('Test passed: Unauthenticated request to /ref/insert rejected with 401.');
            server.close();
            process.exit(0);
        } else {
            console.error(`Test failed: Expected 401, got ${res.statusCode}`);
            server.close();
            process.exit(1);
        }
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

    req.write(JSON.stringify({
        b_category: 'test',
        b_date: '2023-01-01',
        b_sector: '1',
        b_client: 'test',
        b_text: 'test'
    }));
    req.end();

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

runTest();
