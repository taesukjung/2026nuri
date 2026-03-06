const assert = require('assert');
const http = require('http');
const path = require('path');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');
let findAndCountAllCalled = false;
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
    findAndCountAll: () => {
      findAndCountAllCalled = true;
      return Promise.resolve({ count: 1, rows: [{ id: 1 }] });
    },
    findAll: () => {
      findAllCalled = true;
      return Promise.resolve([{ id: 1 }]);
    },
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => {
      findAndCountAllCalled = true;
      return Promise.resolve({ count: 1, rows: [{ id: 1 }] });
    },
    findAll: () => {
      findAllCalled = true;
      return Promise.resolve([{ id: 1 }]);
    },
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
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

function fetch(port, path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: 'GET'
        };
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);

    // Test BBS getContent
    findAllCalled = false;
    findAndCountAllCalled = false;
    await fetch(port, '/bbs/getContent?b_id=1');
    assert.strictEqual(findAndCountAllCalled, false, 'findAndCountAll should NOT be called for /bbs/getContent');
    assert.strictEqual(findAllCalled, true, 'findAll should be called for /bbs/getContent');

    // Test Ref getContent
    findAllCalled = false;
    findAndCountAllCalled = false;
    await fetch(port, '/ref/getContent?b_id=1');
    assert.strictEqual(findAndCountAllCalled, false, 'findAndCountAll should NOT be called for /ref/getContent');
    assert.strictEqual(findAllCalled, true, 'findAll should be called for /ref/getContent');

    console.log('getContent performance test passed!');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    server.close();
    process.exit(1);
  }
}

runTest();
