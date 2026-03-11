const express = require('express');
const http = require('http');
const path = require('path');

// Mock models
const mockTblBbs = {
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    destroy: () => Promise.resolve({}),
    findOne: () => Promise.resolve({ b_count: 0, b_text: 'test' }),
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    count: (opts, cb) => cb && cb(0)
};

// Mock Sequelize Op
const mockSequelize = {
    Op: { like: 'like' }
};

// Mock express-paginate
const mockPaginate = {
    middleware: () => (req, res, next) => next(),
    getArrayPages: () => () => []
};

// Pre-populate require cache
try {
    require.cache[require.resolve('../models')] = {
        exports: { tbl_bbs: mockTblBbs }
    };
    // Mock sequelize package
    require.cache[require.resolve('sequelize')] = {
        exports: mockSequelize
    };
    // Mock express-paginate
    require.cache[require.resolve('express-paginate')] = {
        exports: mockPaginate
    };
} catch (e) {
    console.error("Error mocking dependencies:", e);
    process.exit(1);
}

// Load the controller
const bbsController = require('../routes/bbsController');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mock session middleware
app.use((req, res, next) => {
    // Check a header to simulate session
    if (req.headers['x-mock-session'] === 'admin') {
        req.session = { isAdmin: true };
    } else {
        req.session = {};
    }
    next();
});

// Mock View Engine
app.engine('html', function (filePath, options, callback) {
    return callback(null, 'Rendered View');
});
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'html');


// Mount the controller
const router = bbsController(app);
app.use('/bbs', router);


// Helper to run request
function makeRequest(path, method, sessionHeader, callback) {
    const options = {
        hostname: 'localhost',
        port: 3001, // Use different port
        path: '/bbs' + path,
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (sessionHeader) {
        options.headers['x-mock-session'] = sessionHeader;
    }

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => callback(res, data));
    });

    req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        callback({ statusCode: 500 }, e.message);
    });

    req.end();
}

// Start server
const server = app.listen(3001, () => {
    console.log('Test server running on port 3001');

    let passed = 0;
    let failed = 0;

    function runTest(name, path, method, session, expectedStatus) {
        return new Promise((resolve) => {
            makeRequest(path, method, session, (res) => {
                // If expectedStatus is 200, accept 302 as well (redirects)
                const isSuccess = res.statusCode === expectedStatus || (expectedStatus === 200 && res.statusCode === 302);

                if (isSuccess) {
                    console.log(`✅ [PASS] ${name}: Got ${res.statusCode}`);
                    passed++;
                } else {
                    console.error(`❌ [FAIL] ${name}: Expected ${expectedStatus}, got ${res.statusCode}`);
                    failed++;
                }
                resolve();
            });
        });
    }

    async function runAllTests() {
        console.log("Starting Security Verification...");

        // Test 1: POST /insert without session (Expect 401)
        await runTest('Insert without session', '/insert', 'POST', null, 401);

        // Test 2: POST /insert WITH session (Expect 200 or 302)
        await runTest('Insert with session', '/insert', 'POST', 'admin', 200);

        // Test 3: POST /update without session
        await runTest('Update without session', '/update', 'POST', null, 401);

        // Test 4: POST /update with session
        await runTest('Update with session', '/update', 'POST', 'admin', 200);

         // Test 5: POST /delete without session
        await runTest('Delete without session', '/delete', 'POST', null, 401);

        // Test 6: POST /notice/insert without session
        await runTest('Notice Insert without session', '/notice/insert', 'POST', null, 401);

        // Test 7: GET /list (public) should be 200 regardless
        await runTest('List public', '/list', 'GET', null, 200);

        server.close();

        console.log(`\nResults: ${passed} passed, ${failed} failed.`);

        if (failed > 0) process.exit(1);
        else process.exit(0);
    }

    runAllTests();
});
