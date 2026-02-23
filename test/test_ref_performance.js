const assert = require('assert');
const path = require('path');
const http = require('http');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');

let findAllCallCount = 0;
let createCallCount = 0;

const mockModels = {
    sequelize: {
        sync: () => Promise.resolve(),
        Op: { like: 'like' },
        literal: (val) => val,
        import: () => { }
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
        create: () => {
            createCallCount++;
            return Promise.resolve({});
        },
        count: (opts, cb) => {
             if(cb && typeof cb === 'function') cb(0);
             return Promise.resolve(0);
        },
        findAll: () => {
            findAllCallCount++;
            return Promise.resolve([]);
        },
        findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
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

async function runTest() {
    try {
        const port = await listenOnFreePort(server);
        console.log(`Test server running on port ${port}`);

        const postData = JSON.stringify({
            b_category: 'test',
            b_date: '2023-01-01',
            b_sector: '1',
            b_client: 'test',
            b_text: 'test content'
        });

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/ref/insert',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`LOCATION: ${res.headers.location}`);

            try {
                // Verify redirect
                if (res.statusCode === 302) {
                    assert.strictEqual(res.headers.location, '/move/archive/casestudy.html', 'Should redirect to casestudy page');
                } else {
                    console.error('Expected 302 Redirect, got ' + res.statusCode);
                }

                // Verify mocked calls
                console.log(`Create called: ${createCallCount}`);
                console.log(`FindAll called: ${findAllCallCount}`);

                assert.strictEqual(createCallCount, 1, 'tbl_ref.create should be called once');

                // This is the condition we expect to FAIL initially (findAllCallCount > 0)
                // Or rather, we want to confirm it IS called > 0 before fix, and == 0 after fix.
                // For now, let's just log it.

                res.resume();
                server.close();

                if (findAllCallCount > 0) {
                    console.log('PERFORMANCE ISSUE DETECTED: findAll was called during insert.');
                } else {
                    console.log('OPTIMIZED: findAll was NOT called during insert.');
                }

                process.exit(0);
            } catch (e) {
                console.error('Test failed:', e.message);
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

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

runTest();
