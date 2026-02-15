const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// --- Mocking ---
// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCallCount = 0;
let createCallCount = 0;

const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    Op: { like: 'like' },
    literal: (val) => val,
    import: () => {},
    define: () => {}
  },
  Sequelize: {
    Op: { like: 'like' }
  },
  tbl_bbs: {
    // Basic mocks for bbsController if it loads
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    // Spies for refController
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: (data) => {
      createCallCount++;
      return Promise.resolve(data);
    },
    count: () => {
        // Return a promise that resolves immediately, mimicking fire-and-forget logging
        return Promise.resolve(0);
    },
    findAll: () => {
      findAllCallCount++;
      return Promise.resolve([]); // Return empty array to simulate empty table or result
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

// Require app (after mocking)
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

    const postData = querystring.stringify({
      b_category: 'test_cat',
      b_date: '2023-01-01',
      b_sector: '1',
      b_client: 'test_client',
      b_text: 'test_text'
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
      // Expect redirect (302)
      if (res.statusCode !== 302) {
          console.error('Expected redirect (302), got:', res.statusCode);
          server.close();
          process.exit(1);
      }

      // Check redirection location
      const location = res.headers.location;
      if (location !== '/move/archive/casestudy.html') {
          console.error('Expected redirect to /move/archive/casestudy.html, got:', location);
          server.close();
          process.exit(1);
      }

      console.log(`findAll call count: ${findAllCallCount}`);
      console.log(`create call count: ${createCallCount}`);

      if (createCallCount !== 1) {
          console.error('Expected 1 create call, got:', createCallCount);
          server.close();
          process.exit(1);
      }

      if (findAllCallCount !== 0) {
          console.error('Optimization FAILED: findAll was called', findAllCallCount, 'times');
          server.close();
          process.exit(1);
      }

      console.log('Optimization Verified: findAll was NOT called');
      server.close();
      process.exit(0);
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
