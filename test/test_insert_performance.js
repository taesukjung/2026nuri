const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

// Global counters for test assertions
let countCalled = 0;
let findAllCalled = 0;
let createCalled = 0;

// Mock models
const mockModels = {
    tbl_bbs: {
        create: async (options) => {
            createCalled++;
            return { b_id: 1 };
        },
        count: async (options, callback) => {
            countCalled++;
            if (callback) callback(1);
            return 1;
        },
        findAll: async (options) => {
            findAllCalled++;
            return [];
        }
    },
    tbl_ref: {
        create: async (options) => {
            createCalled++;
            return { b_id: 1 };
        },
        count: async (options, callback) => {
            countCalled++;
            if (callback) callback(1);
            return 1;
        },
        findAll: async (options) => {
            findAllCalled++;
            return [];
        }
    }
};

// Inject mock models into require.cache
const modelsPath = require.resolve('../models');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: mockModels
};

// Mock moment timezone
const moment = require('moment');
require('moment-timezone');

// Import controllers after mocking
const bbsController = require('../routes/bbsController');
const refController = require('../routes/refController');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Mock response object
const mockRes = () => {
    const res = {};
    res.render = (view, data) => {
        res.view = view;
        return res;
    };
    res.redirect = (url) => {
        res.url = url;
        return res;
    };
    return res;
};

async function runTests() {
    try {
        console.log('Testing /bbs/insert optimization...');

        let req = { body: { b_category: 'test', b_date: '2023-10-26', b_subject: 'test', b_text: 'test' } };
        let res = mockRes();

        // Find the route handler for POST /insert
        const bbsRouter = bbsController(app);
        const insertRoute = bbsRouter.stack.find(layer => layer.route && layer.route.path === '/insert' && layer.route.methods.post);

        if (!insertRoute) {
            throw new Error("Could not find POST /insert route in bbsController");
        }

        countCalled = 0;
        findAllCalled = 0;
        createCalled = 0;

        // Execute the handler
        await insertRoute.route.stack[0].handle(req, res, () => {});

        assert.strictEqual(createCalled, 1, "tbl_bbs.create SHOULD be called.");
        assert.strictEqual(countCalled, 0, "tbl_bbs.count should NOT be called. Expected optimization was missing.");

        console.log('Testing /ref/insert optimization...');

        req = { body: { b_category: 'test', b_date: '2023-10-26', b_sector: '1', b_client: 'test', b_text: 'test' } };
        res = mockRes();

        // Find the route handler for POST /insert
        const refRouter = refController(app);
        const refInsertRoute = refRouter.stack.find(layer => layer.route && layer.route.path === '/insert' && layer.route.methods.post);

        if (!refInsertRoute) {
            throw new Error("Could not find POST /insert route in refController");
        }

        countCalled = 0;
        findAllCalled = 0;
        createCalled = 0;

        // Execute the handler
        await refInsertRoute.route.stack[0].handle(req, res, () => {});

        assert.strictEqual(createCalled, 1, "tbl_ref.create SHOULD be called.");
        assert.strictEqual(countCalled, 0, "tbl_ref.count should NOT be called. Expected optimization was missing.");
        assert.strictEqual(findAllCalled, 0, "tbl_ref.findAll should NOT be called. Expected optimization was missing.");

        console.log('✅ test_insert_performance passed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ test_insert_performance failed:', err.message);
        process.exit(1);
    }
}

runTests();
