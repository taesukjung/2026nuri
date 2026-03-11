const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCallCount = 0;

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
    count: (opts, cb) => cb ? cb(0) : Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: (opts, cb) => {
        if(cb) cb(0);
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCallCount++;
        return Promise.resolve([]);
    },
    findOne: () => Promise.resolve({}),
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

    const postData = querystring.stringify({
      b_category: 'test',
      b_date: '2023-01-01',
      b_sector: '1',
      b_client: 'test client',
      b_text: 'test text'
    });

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/ref/insert',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);

      res.resume();
      res.on('end', () => {
        console.log(`findAllCallCount: ${findAllCallCount}`);

        try {
            // Check if findAll was called
            // We optimized the code to remove this redundant call.
            if (findAllCallCount === 0) {
                console.log('Test Passed: Redundant findAll call removed.');
                server.close();
                process.exit(0);
            } else {
                console.error('Test Failed: Redundant findAll call STILL detected (Expected 0 calls).');
                server.close();
                process.exit(1);
            }
        } catch (e) {
             console.error('Test Error:', e);
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

runTest();
