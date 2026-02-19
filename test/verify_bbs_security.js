const assert = require('assert');
const http = require('http');
const path = require('path');
const { Sequelize } = require('sequelize');

// Mock models/index.js to avoid DB connection
const modelsPath = path.resolve(__dirname, '../models/index.js');
const mockTblBbs = {
    create: () => Promise.resolve({ b_id: 1 }),
    count: () => Promise.resolve(1),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve([1]),
    destroy: () => Promise.resolve(1),
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] })
};

const mockModels = {
    sequelize: {
        sync: () => Promise.resolve(),
        import: () => {},
        literal: (val) => val,
        Op: { like: 'like' }
    },
    Sequelize: {
        Op: { like: 'like' }
    },
    tbl_bbs: mockTblBbs,
    tbl_ref: {
        findAndCountAll: () => Promise.resolve({ count: 0, rows: [] })
    },
    tbl_auth: {}
};

require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: mockModels
};

const app = require('../app');

const server = http.createServer(app);

server.listen(0, () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    const postData = JSON.stringify({
        b_subject: 'Test Subject',
        b_text: 'Test Text',
        b_category: '1',
        b_date: '2023-01-01'
    });

    const options = {
        hostname: 'localhost',
        port: port,
        path: '/bbs/insert',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);

        try {
            assert.strictEqual(res.statusCode, 401, 'Protected route should return 401 Unauthorized');
            console.log('Test Passed: Route /bbs/insert is protected (401).');
            res.resume();
            server.close();
            process.exit(0);
        } catch (e) {
            console.error('Test Failed:', e.message);
            server.close();
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
});
