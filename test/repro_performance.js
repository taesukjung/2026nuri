const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCalled = false;
let findAndCountAllCalled = false;

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
    findAndCountAll: () => {
      findAndCountAllCalled = true;
      return Promise.resolve({ count: 0, rows: [] });
    },
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => {
        findAllCalled = true;
        return Promise.resolve([]);
    },
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => {
      findAndCountAllCalled = true;
      return Promise.resolve({ count: 0, rows: [] });
    },
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => {
        findAllCalled = true;
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
  let failures = 0;
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    // Test 1: POST /ref/insert
    console.log('Testing /ref/insert...');
    findAllCalled = false;
    findAndCountAllCalled = false;

    await new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            b_category: 'test',
            b_date: '2023',
            b_sector: '1',
            b_client: 'test',
            b_text: 'test'
        });

        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/ref/insert',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }, (res) => {
            res.resume();
            res.on('end', resolve);
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });

    if (findAllCalled) {
        console.error('FAIL: tbl_ref.findAll was called during /ref/insert');
        failures++;
    } else {
        console.log('PASS: tbl_ref.findAll was NOT called during /ref/insert');
    }

    // Test 2: GET /ref/getContent
    console.log('Testing /ref/getContent...');
    findAllCalled = false;
    findAndCountAllCalled = false;

    await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/ref/getContent?b_id=1`, (res) => {
            res.resume();
            res.on('end', resolve);
        }).on('error', reject);
    });

    if (findAndCountAllCalled) {
        console.error('FAIL: tbl_ref.findAndCountAll was called during /ref/getContent');
        failures++;
    } else if (!findAllCalled) {
        console.error('FAIL: tbl_ref.findAll was NOT called during /ref/getContent');
        failures++;
    } else {
        console.log('PASS: tbl_ref.findAll used correctly in /ref/getContent');
    }

    // Test 3: GET /bbs/getContent
    console.log('Testing /bbs/getContent...');
    findAllCalled = false;
    findAndCountAllCalled = false;

    await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}/bbs/getContent?b_id=1`, (res) => {
            res.resume();
            res.on('end', resolve);
        }).on('error', reject);
    });

    if (findAndCountAllCalled) {
        console.error('FAIL: tbl_bbs.findAndCountAll was called during /bbs/getContent');
        failures++;
    } else if (!findAllCalled) {
         console.error('FAIL: tbl_bbs.findAll was NOT called during /bbs/getContent');
         failures++;
    } else {
        console.log('PASS: tbl_bbs.findAll used correctly in /bbs/getContent');
    }

    server.close();

    if (failures > 0) {
        console.log(`\nTest failed with ${failures} failures.`);
        process.exit(1);
    } else {
        console.log('\nAll tests passed!');
        process.exit(0);
    }

  } catch (error) {
    console.error('Error running test:', error);
    server.close();
    process.exit(1);
  }
}

runTest();
