const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

// Global mock for res.render to prevent view lookup errors
const mockRenderMiddleware = (req, res, next) => {
    res.render = (view) => res.send('mock_render');
    next();
};

function createMockApp() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(mockRenderMiddleware);
    return app;
}

// Mock models to track calls
let countCalled = false;
let findAllCalled = false;
let createCalled = false;

function resetMocks() {
    countCalled = false;
    findAllCalled = false;
    createCalled = false;
}

const mockModel = {
    count: () => {
        countCalled = true;
        return Promise.resolve(0);
    },
    findAll: () => {
        findAllCalled = true;
        return Promise.resolve([]);
    },
    create: () => {
        createCalled = true;
        return Promise.resolve({ id: 1 });
    }
};

// We need to intercept the models when they are required in controllers
const mockModels = {
    tbl_bbs: mockModel,
    tbl_ref: mockModel
};

// Patch require cache manually since proxyquire is not available
const modelsPath = require.resolve('../models');
require('../models'); // Pre-load to cache
require.cache[modelsPath].exports = mockModels;

const bbsController = require('../routes/bbsController');
const refController = require('../routes/refController');

async function runTests() {
    console.log("Running test: test_redundant_queries.js");
    let exitCode = 0;

    // Test bbsController /insert
    resetMocks();
    const bbsApp = createMockApp();
    bbsApp.use('/bbs', bbsController(bbsApp));
    const bbsServer = bbsApp.listen(0);
    const bbsPort = bbsServer.address().port;

    try {
        const response = await fetch(`http://localhost:${bbsPort}/bbs/insert`, {
            method: 'POST',
            body: new URLSearchParams({ b_subject: 'test', b_text: 'test content' })
        });
        await response.text();
        assert.strictEqual(createCalled, true, "create should be called for bbs/insert");
        assert.strictEqual(countCalled, false, "count should NOT be called for bbs/insert");
        console.log("✅ bbsController /insert test passed.");
    } catch (e) {
        console.error("❌ bbsController /insert test failed:", e);
        exitCode = 1;
    } finally {
        bbsServer.close();
    }

    // Test refController /insert
    resetMocks();
    const refApp = createMockApp();
    refApp.use('/ref', refController(refApp));
    const refServer = refApp.listen(0);
    const refPort = refServer.address().port;

    try {
        const response = await fetch(`http://localhost:${refPort}/ref/insert`, {
            method: 'POST',
            body: new URLSearchParams({ b_title: 'test', b_text: 'test content' })
        });
        await response.text();
        assert.strictEqual(createCalled, true, "create should be called for ref/insert");
        assert.strictEqual(countCalled, false, "count should NOT be called for ref/insert");
        assert.strictEqual(findAllCalled, false, "findAll should NOT be called for ref/insert");
        console.log("✅ refController /insert test passed.");
    } catch (e) {
        console.error("❌ refController /insert test failed:", e);
        exitCode = 1;
    } finally {
        refServer.close();
    }

    process.exit(exitCode);
}

runTests();
