const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCalled = false;

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
     findOne: () => Promise.resolve({}),
  },
  tbl_ref: {
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => {
        findAllCalled = true;
        console.log('[[MOCK]] tbl_ref.findAll called');
        return Promise.resolve([]);
    },
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_auth: {
     findOne: () => Promise.resolve({})
  }
};

// Inject mock into require cache
// We must populate this BEFORE requiring app.js
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

    const postData = querystring.stringify({
      b_category: 'test',
      b_date: '2023-10-27',
      b_sector: '1',
      b_client: 'client',
      b_text: 'text'
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

      // Consume response data
      res.on('data', () => {});
      res.on('end', () => {
          console.log(`findAllCalled: ${findAllCalled}`);

          if (process.env.EXPECT_OPTIMIZED === 'true') {
              if (findAllCalled) {
                  console.error('FAIL: tbl_ref.findAll should NOT be called after optimization.');
                  process.exit(1);
              } else {
                  console.log('SUCCESS: tbl_ref.findAll was NOT called.');
                  process.exit(0);
              }
          } else {
              if (!findAllCalled) {
                  console.error('FAIL: tbl_ref.findAll SHOULD be called (reproducing the issue).');
                  process.exit(1);
              } else {
                  console.log('SUCCESS: tbl_ref.findAll WAS called (issue reproduced).');
                  process.exit(0);
              }
          }
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
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
