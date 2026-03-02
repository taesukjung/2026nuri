const assert = require('assert');
const express = require('express');
const http = require('http');

// Mock express-paginate to prevent middleware errors during isolated testing
const paginateMock = {
    middleware: (limit, maxLimit) => (req, res, next) => next(),
    getArrayPages: (req) => (limit, pageCount, currentPage) => []
};

// Mock the models
let findAndCountAllCalls = 0;
let findAllCalls = 0;

const mockModels = {
    tbl_ref: {
        findAndCountAll: async (options) => {
            findAndCountAllCalls++;
            return { count: 1, rows: [{ id: 1, content: 'test' }] };
        },
        findAll: async (options) => {
            findAllCalls++;
            return [{ id: 1, content: 'test' }];
        }
    },
    tbl_bbs: {
        findAndCountAll: async (options) => {
            findAndCountAllCalls++;
            return { count: 1, rows: [{ id: 1, content: 'test' }] };
        },
        findAll: async (options) => {
            findAllCalls++;
            return [{ id: 1, content: 'test' }];
        }
    }
};

// Override require using require.cache to intercept dependencies
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
    exports: paginateMock
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Load controllers
const refController = require('../routes/refController')(app);
const bbsController = require('../routes/bbsController')(app);

app.use('/ref', refController);
app.use('/bbs', bbsController);

const server = app.listen(0, async () => {
    const port = server.address().port;
    try {
        console.log(`Testing /ref/getContent on port ${port}...`);

        await new Promise((resolve, reject) => {
            http.get(`http://localhost:${port}/ref/getContent?b_id=1`, (res) => {
                if (res.statusCode !== 200) reject(new Error(`Status ${res.statusCode}`));
                res.on('data', () => {});
                res.on('end', resolve);
            }).on('error', reject);
        });

        console.log("Testing /bbs/getContent...");
        await new Promise((resolve, reject) => {
            http.get(`http://localhost:${port}/bbs/getContent?b_id=1`, (res) => {
                if (res.statusCode !== 200) reject(new Error(`Status ${res.statusCode}`));
                res.on('data', () => {});
                res.on('end', resolve);
            }).on('error', reject);
        });

        console.log(`findAndCountAll calls: ${findAndCountAllCalls}`);
        console.log(`findAll calls: ${findAllCalls}`);

        // The test should pass if optimization is present (findAndCountAll not called)
        assert.strictEqual(findAndCountAllCalls, 0, 'findAndCountAll should not be called in /getContent routes (optimization missing)');
        assert.strictEqual(findAllCalls, 2, 'findAll should be called exactly twice for the two /getContent routes');

        console.log("Performance test passed!");
        server.close();
        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e.message);
        server.close();
        process.exit(1);
    }
});
