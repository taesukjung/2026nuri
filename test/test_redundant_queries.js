const assert = require('assert');
const http = require('http');
const path = require('path');
const express = require('express');

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
    create: () => Promise.resolve({}),
    count: () => {
        countCalled = true;
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCalled = true;
        return Promise.resolve([]);
    }
  },
  tbl_ref: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => {
        countCalled = true;
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCalled = true;
        return Promise.resolve([]);
    }
  }
};

require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// mock res.render
app.use((req, res, next) => {
    res.render = () => res.send('mock');
    next();
});

const refController = require('../routes/refController');
const bbsController = require('../routes/bbsController');

app.use('/ref', refController(app));
app.use('/bbs', bbsController(app));

const server = http.createServer(app);

function listenOnFreePort(server) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
    server.on('error', reject);
  });
}

function makeRequest(port, pathStr) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: pathStr,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });

        req.on('error', reject);
        req.write(JSON.stringify({ b_category: 'test' }));
        req.end();
    });
}

async function runTest() {
    try {
        const port = await listenOnFreePort(server);

        // test ref
        await makeRequest(port, '/ref/insert');
        assert.strictEqual(countCalled, false, 'tbl_ref.count() was unexpectedly called');
        assert.strictEqual(findAllCalled, false, 'tbl_ref.findAll() was unexpectedly called');

        // reset
        countCalled = false;
        findAllCalled = false;

        // test bbs
        await makeRequest(port, '/bbs/insert');
        assert.strictEqual(countCalled, false, 'tbl_bbs.count() was unexpectedly called');

        console.log('Test passed. Redundant queries are no longer executed.');
        server.close();
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        server.close();
        process.exit(1);
    }
}

runTest();
