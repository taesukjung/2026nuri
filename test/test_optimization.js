const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCalled = false;
let findAndCountAllCalled = false;
let bbsFindAndCountAllCalled = false;
let createCalled = false;

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
      bbsFindAndCountAllCalled = true;
      return Promise.resolve({ count: 0, rows: [] });
    },
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    create: () => {
      createCalled = true;
      return Promise.resolve({});
    },
    count: (opts, cb) => {
        if (cb) cb(0);
        return Promise.resolve(0);
    },
    findAll: () => {
      findAllCalled = true;
      return Promise.resolve([]);
    },
    findAndCountAll: () => {
      findAndCountAllCalled = true;
      return Promise.resolve({ count: 0, rows: [] });
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

function makeRequest(port, method, path, postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    // Test 1: POST /ref/insert
    console.log('Testing POST /ref/insert...');
    findAllCalled = false;
    createCalled = false;
    const postData = querystring.stringify({
      b_category: '1',
      b_date: '2023-10-27',
      b_sector: '1',
      b_client: 'Test',
      b_text: 'Test Text'
    });

    await makeRequest(port, 'POST', '/ref/insert', postData);

    if (findAllCalled) {
        console.log('FAIL: tbl_ref.findAll was called during insert (Optimization needed).');
    } else {
        console.log('PASS: tbl_ref.findAll was NOT called during insert.');
    }

    // Test 2: GET /ref/getContent
    console.log('Testing GET /ref/getContent...');
    findAndCountAllCalled = false;
    findAllCalled = false; // Reset

    await makeRequest(port, 'GET', '/ref/getContent?b_id=1', null);

    if (findAndCountAllCalled) {
        console.log('FAIL: tbl_ref.findAndCountAll was called during getContent (Optimization needed).');
    } else {
        console.log('PASS: tbl_ref.findAndCountAll was NOT called during getContent.');
    }

    // Test 3: GET /bbs/getContent
    console.log('Testing GET /bbs/getContent...');
    bbsFindAndCountAllCalled = false;
    await makeRequest(port, 'GET', '/bbs/getContent?b_id=1', null);

    if (bbsFindAndCountAllCalled) {
        console.log('FAIL: tbl_bbs.findAndCountAll was called during getContent (Optimization needed).');
    } else {
        console.log('PASS: tbl_bbs.findAndCountAll was NOT called during getContent.');
    }

    server.close();
    process.exit(0);

  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

runTests();
