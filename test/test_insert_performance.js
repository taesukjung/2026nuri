const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');
let countCalled = false;
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
    findAll: () => {
      findAllCalled = true;
      return Promise.resolve([]);
    },
    create: () => Promise.resolve({}),
    count: () => {
        countCalled = true;
        return Promise.resolve(0);
    },
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    findAll: () => {
      findAllCalled = true;
      return Promise.resolve([]);
    },
    create: () => Promise.resolve({}),
    count: () => {
        countCalled = true;
        return Promise.resolve(0);
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
      resolve(server.address().port);
    });
    server.on('error', reject);
  });
}

function post(port, pathStr, data) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(data);
        const options = {
            hostname: 'localhost',
            port: port,
            path: pathStr,
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = http.request(options, (res) => {
            let respData = '';
            res.on('data', chunk => respData += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data: respData }));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);

    // Test BBS insert
    countCalled = false;
    findAllCalled = false;
    await post(port, '/bbs/insert', {
        b_category: '1',
        b_date: '2023-01-01',
        b_subject: 'test',
        b_text: 'test'
    });

    assert.strictEqual(countCalled, false, 'Redundant count() should NOT be called for /bbs/insert');
    assert.strictEqual(findAllCalled, false, 'Redundant findAll() should NOT be called for /bbs/insert');

    // Test Ref insert
    countCalled = false;
    findAllCalled = false;
    await post(port, '/ref/insert', {
        b_category: '1',
        b_date: '2023-01-01',
        b_sector: '1',
        b_client: 'test',
        b_text: 'test'
    });

    assert.strictEqual(countCalled, false, 'Redundant count() should NOT be called for /ref/insert');
    assert.strictEqual(findAllCalled, false, 'Redundant findAll() should NOT be called for /ref/insert');

    console.log('insert performance test passed!');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    server.close();
    process.exit(1);
  }
}

runTest();
