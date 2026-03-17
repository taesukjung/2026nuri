const assert = require('assert');
const express = require('express');

// Mock models
let countCalls = 0;
let findAllCalls = 0;
let findAndCountAllCalls = 0;

const mockTbl = {
    create: async () => ({ id: 1 }),
    count: (opts, cb) => {
        countCalls++;
        if (cb) cb(1);
        return Promise.resolve(1);
    },
    findAll: async () => {
        findAllCalls++;
        return [{ id: 1 }];
    },
    findAndCountAll: async () => {
        findAndCountAllCalls++;
        return { count: 1, rows: [{ id: 1 }] };
    }
};

// Mock the models module
require.cache[require.resolve('../models')] = {
    exports: {
        tbl_bbs: mockTbl,
        tbl_ref: mockTbl
    }
};

const bbsRouterFactory = require('../routes/bbsController');
const refRouterFactory = require('../routes/refController');

async function testPerformance() {
    console.log("Starting Bolt Performance Test...");

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    const bbsRouter = bbsRouterFactory(app);
    const refRouter = refRouterFactory(app);

    // Mock Express res for our direct handler testing
    const mockRes = {
        render: () => {},
        redirect: () => {},
        send: () => {}
    };

    // Helper to find and call the route handler
    const callHandler = async (router, path, method, req) => {
        const layer = router.stack.find(l => l.route && l.route.path === path && l.route.methods[method]);
        if (layer) {
            const handler = layer.route.stack[0].handle;
            // Handle async execution within the handler
            return new Promise((resolve) => {
                const res = {
                    ...mockRes,
                    render: (...args) => { mockRes.render(...args); resolve(); },
                    redirect: (...args) => { mockRes.redirect(...args); resolve(); },
                    send: (...args) => { mockRes.send(...args); resolve(); }
                };
                handler(req, res, () => resolve());
            });
        }
        throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
    };

    try {
        // --- Test /bbs/insert ---
        console.log("Testing /bbs/insert...");
        countCalls = 0;
        findAllCalls = 0;
        findAndCountAllCalls = 0;
        await callHandler(bbsRouter, '/insert', 'post', { body: {} });
        assert.strictEqual(countCalls, 0, "tbl_bbs.count should not be called in /insert");

        // --- Test /bbs/getContent ---
        console.log("Testing /bbs/getContent...");
        countCalls = 0;
        findAllCalls = 0;
        findAndCountAllCalls = 0;
        await callHandler(bbsRouter, '/getContent', 'get', { query: { b_id: 1 } });
        assert.strictEqual(findAndCountAllCalls, 0, "tbl_bbs.findAndCountAll should not be called in /getContent");
        assert.strictEqual(findAllCalls, 1, "tbl_bbs.findAll should be called in /getContent");

        // --- Test /ref/insert ---
        console.log("Testing /ref/insert...");
        countCalls = 0;
        findAllCalls = 0;
        findAndCountAllCalls = 0;
        await callHandler(refRouter, '/insert', 'post', { body: {} });
        assert.strictEqual(countCalls, 0, "tbl_ref.count should not be called in /insert");
        assert.strictEqual(findAllCalls, 0, "tbl_ref.findAll should not be called in /insert before redirect");

        // --- Test /ref/getContent ---
        console.log("Testing /ref/getContent...");
        countCalls = 0;
        findAllCalls = 0;
        findAndCountAllCalls = 0;
        await callHandler(refRouter, '/getContent', 'get', { query: { b_id: 1 } });
        assert.strictEqual(findAndCountAllCalls, 0, "tbl_ref.findAndCountAll should not be called in /getContent");
        assert.strictEqual(findAllCalls, 1, "tbl_ref.findAll should be called in /getContent");

        console.log("✅ All performance tests passed!");
    } catch (error) {
        console.error("❌ Performance test failed:", error);
        process.exit(1);
    }
}

testPerformance();
