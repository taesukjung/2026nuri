const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCallCount = 0;
let countCallCount = 0;
let createCallCount = 0;

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
    create: () => {
        createCallCount++;
        return Promise.resolve({});
    },
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
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

      // We expect a redirect (302)
      if (res.statusCode === 302) {
          console.log('Got redirect as expected.');
      } else {
          console.error('Expected 302 redirect, got ' + res.statusCode);
      }

      res.resume();
      server.close();

      console.log(`tbl_ref.create called: ${createCallCount}`);
      console.log(`tbl_ref.count called: ${countCallCount}`);
      console.log(`tbl_ref.findAll called: ${findAllCallCount}`);

      if (createCallCount === 1 && findAllCallCount > 0) {
          console.log('REPRODUCTION SUCCESS: findAll was called unnecessarily.');
          process.exit(0);
      } else if (createCallCount === 1 && findAllCallCount === 0) {
          console.log('OPTIMIZATION SUCCESS: findAll was NOT called.');
          process.exit(0);
      } else {
          console.error('Test failed: Unexpected call counts.');
          process.exit(1);
      }

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
