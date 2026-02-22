const assert = require('assert');
const http = require('http');
const path = require('path');

// Mock models/index.js BEFORE requiring app.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCallCount = 0;

const mockTblRef = {
  create: (data) => Promise.resolve({
      b_id: 123,
      ...data
  }),
  count: (opts, cb) => {
      if (cb) cb(10);
      return Promise.resolve(10);
  },
  findAll: (opts) => {
      console.log('--- findAll called! ---');
      findAllCallCount++;
      return Promise.resolve([{ b_id: 1 }, { b_id: 2 }]);
  },
  findAndCountAll: (opts) => Promise.resolve({ count: 0, rows: [] }),
  update: (data, opts) => Promise.resolve([1]),
  destroy: (opts) => Promise.resolve(1)
};

const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    Op: { like: 'like', or: 'or' },
    literal: (val) => val,
    import: () => {}
  },
  Sequelize: {
    Op: { like: 'like', or: 'or' }
  },
  tbl_ref: mockTblRef,
  tbl_bbs: {
      findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
      findOne: () => Promise.resolve({}),
      update: () => Promise.resolve(),
      create: () => Promise.resolve({})
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

// Now load the app
let app;
try {
    app = require('../app');
} catch (e) {
    console.error('Failed to load app:', e);
    process.exit(1);
}

const server = http.createServer(app);

// Helper to start server on random port
function startServer() {
    return new Promise((resolve, reject) => {
        server.listen(0, () => {
            resolve(server.address().port);
        });
        server.on('error', reject);
    });
}

async function runTest() {
    try {
        const port = await startServer();
        console.log(`Test server running on port ${port}`);

        const postData = 'b_category=Test&b_date=2023-10-27&b_sector=1&b_client=TestClient&b_text=TestText';

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
            console.log(`LOCATION: ${res.headers.location}`);

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let success = true;

                // Check redirect
                if (res.statusCode !== 302) {
                    console.error('FAIL: Expected 302 redirect, got ' + res.statusCode);
                    success = false;
                } else if (res.headers.location !== '/move/archive/casestudy.html') {
                    console.error('FAIL: Expected redirect to /move/archive/casestudy.html, got ' + res.headers.location);
                    success = false;
                } else {
                    console.log('PASS: Redirect works correctly.');
                }

                // Check optimization
                console.log(`findAll calls: ${findAllCallCount}`);
                if (findAllCallCount > 0) {
                    console.error('FAIL: findAll was called (Optimization needed)');
                    success = false;
                } else {
                    console.log('PASS: findAll was NOT called (Optimization applied)');
                }

                server.close();
                process.exit(success ? 0 : 1);
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
            server.close();
            process.exit(1);
        });

        req.write(postData);
        req.end();

    } catch (err) {
        console.error('Test error:', err);
        server.close();
        process.exit(1);
    }
}

runTest();
