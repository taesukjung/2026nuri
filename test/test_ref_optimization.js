const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// --- MOCKING ---
let findAllCallCount = 0;
let countCallCount = 0;
let findAndCountAllCallCount = 0;

const modelsPath = path.resolve(__dirname, '../models/index.js');
const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    Op: { like: 'like' },
    literal: (val) => val,
    import: () => {}
  },
  Sequelize: {
    Op: { like: 'like' },
    literal: (val) => val
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
    findAndCountAll: (options) => {
        findAndCountAllCallCount++;
        return Promise.resolve({ count: 1, rows: [{ id: 1, title: 'Mock Ref' }] });
    },
    create: (data) => Promise.resolve(data),
    count: () => {
        countCallCount++;
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCallCount++;
        return Promise.resolve([{ id: 1, title: 'Mock Ref' }]); // Simulating fetch of all records
    },
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_auth: {
     findOne: () => Promise.resolve({})
  }
};

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

function postRequest(port, path, data) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(data);
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function getRequest(port, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET'
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    // --- TEST 1: /ref/insert (Redundant findAll and count) ---
    console.log('\n--- Test 1: /ref/insert ---');
    findAllCallCount = 0;
    countCallCount = 0;

    const insertData = {
        b_category: 'Test',
        b_date: '2023-10-27',
        b_sector: '1',
        b_client: 'Test Client',
        b_text: 'Test Text'
    };

    const resInsert = await postRequest(port, '/ref/insert', insertData);

    // In current bad implementation:
    // 1. count() is called (fire and forget, might race, but for mock it's sync promise resolution usually)
    // 2. findAll() is called
    // 3. redirect happens

    // We expect redirect
    if (resInsert.statusCode === 302) {
         console.log('✅ /ref/insert redirects correctly.');
    } else {
         console.error(`❌ /ref/insert failed to redirect. Status: ${resInsert.statusCode}`);
         process.exit(1);
    }

    // Wait a tiny bit for async fire-and-forget count() if needed, though mock is fast.
    await new Promise(r => setTimeout(r, 100));

    console.log(`findAll calls: ${findAllCallCount}`);
    console.log(`count calls: ${countCallCount}`);

    // --- TEST 2: /ref/getContent (Redundant count in findAndCountAll) ---
    console.log('\n--- Test 2: /ref/getContent ---');
    findAndCountAllCallCount = 0;

    const resContent = await getRequest(port, '/ref/getContent?b_id=1');
    const jsonContent = JSON.parse(resContent.body);

    if (jsonContent.REF_LIST && Array.isArray(jsonContent.REF_LIST)) {
        console.log('✅ /ref/getContent returns REF_LIST.');
    } else {
        console.error('❌ /ref/getContent failed to return REF_LIST.');
        process.exit(1);
    }

    console.log(`findAndCountAll calls: ${findAndCountAllCallCount}`);

    server.close();

    // We don't exit with failure here because we are establishing baseline.
    // Ideally, for the optimized version:
    // findAllCallCount should be 0 in Test 1.
    // countCallCount should be 0 in Test 1.
    // findAndCountAllCallCount should be 0 in Test 2 (replaced by findAll).

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

runTest();
