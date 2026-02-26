const assert = require('assert');
const express = require('express');
const http = require('http');
const path = require('path');

// Mock Data
const mockRefData = [
    { b_id: 1, b_text: 'Test Ref' }
];

// Spies
let findAllCallCount = 0;
let countCallCount = 0;
let createCallCount = 0;
let findAndCountAllCallCount = 0;

// Mock Models
const mockModels = {
    tbl_ref: {
        create: (data) => {
            createCallCount++;
            return Promise.resolve({ b_id: 2, ...data });
        },
        count: (options, callback) => {
            countCallCount++;
            if (callback) callback(10);
            return Promise.resolve(10);
        },
        findAll: (options) => {
            findAllCallCount++;
            return Promise.resolve(mockRefData);
        },
        findAndCountAll: (options) => {
            findAndCountAllCallCount++;
            return Promise.resolve({ count: 1, rows: mockRefData });
        },
        update: () => Promise.resolve([1]),
        destroy: () => Promise.resolve(1)
    },
    sequelize: {
        Op: { like: 'like' },
        literal: (str) => str
    }
};

// Mock express-paginate
const mockPaginate = {
    middleware: (limit, maxLimit) => (req, res, next) => {
        req.query.limit = limit;
        next();
    },
    getArrayPages: (req) => (limit, pageCount, currentPage) => []
};

// Setup require cache mocking
const modelsPath = require.resolve('../models');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: mockModels
};

const paginatePath = require.resolve('express-paginate');
require.cache[paginatePath] = {
    id: paginatePath,
    filename: paginatePath,
    loaded: true,
    exports: mockPaginate
};

// Load Controller
const refController = require('../routes/refController');

// Setup App
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Controller
app.use('/ref', refController(app));

// Start Server
const server = http.createServer(app);
server.listen(0, () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    // Helper for requests
    function makeRequest(options, postData) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                ...options
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ res, data }));
            });
            req.on('error', reject);
            if (postData) req.write(postData);
            req.end();
        });
    }

    // Run Tests
    (async () => {
        try {
            // Test 1: POST /ref/insert
            // Optimization: Should NOT call findAll
            const postData = JSON.stringify({
                b_category: '1', b_date: '2023', b_sector: '1', b_client: 'Client', b_text: 'Text'
            });

            console.log('--- Test 1: POST /ref/insert ---');
            await makeRequest({
                path: '/ref/insert',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            }, postData);

            console.log(`findAll call count: ${findAllCallCount}`);
            if (findAllCallCount === 0) {
                console.log('PASS: findAll was NOT called (optimization verified)');
            } else {
                throw new Error(`FAIL: findAll was called ${findAllCallCount} times during insert`);
            }

            // Test 2: GET /ref/getContent
            // Optimization: Should call findAll (not findAndCountAll) and return correct data
            console.log('--- Test 2: GET /ref/getContent ---');
            const { data } = await makeRequest({
                path: '/ref/getContent?b_id=1',
                method: 'GET'
            });

            const response = JSON.parse(data);
            console.log('Response:', response);

            console.log(`findAll call count: ${findAllCallCount}`);
            console.log(`findAndCountAll call count: ${findAndCountAllCallCount}`);

            if (findAllCallCount === 1) { // 0 from prev test + 1 here
                 console.log('PASS: findAll was called for getContent');
            } else {
                 throw new Error('FAIL: findAll was not called for getContent');
            }

            if (findAndCountAllCallCount === 0) {
                console.log('PASS: findAndCountAll was NOT called');
            } else {
                throw new Error('FAIL: findAndCountAll WAS called');
            }

            if (response.REF_LIST && Array.isArray(response.REF_LIST)) {
                console.log('PASS: REF_LIST is an array');
            } else {
                throw new Error('FAIL: REF_LIST format is incorrect');
            }

            console.log('ALL TESTS PASSED');
            server.close();
            process.exit(0);

        } catch (err) {
            console.error(err);
            server.close();
            process.exit(1);
        }
    })();
});
