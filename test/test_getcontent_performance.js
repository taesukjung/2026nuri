const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

// Global counters for test assertions
let findAndCountAllCalled = 0;
let findAllCalled = 0;

// Mock models
const mockModels = {
    tbl_bbs: {
        findAndCountAll: async (options) => {
            findAndCountAllCalled++;
            return { rows: [{ b_id: 1, b_subject: 'Mock BBS Content' }], count: 1 };
        },
        findAll: async (options) => {
            findAllCalled++;
            return [{ b_id: 1, b_subject: 'Mock BBS Content' }];
        }
    },
    tbl_ref: {
        findAndCountAll: async (options) => {
            findAndCountAllCalled++;
            return { rows: [{ b_id: 1, b_client: 'Mock Ref Content' }], count: 1 };
        },
        findAll: async (options) => {
            findAllCalled++;
            return [{ b_id: 1, b_client: 'Mock Ref Content' }];
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

// Import controllers after mocking
const bbsController = require('../routes/bbsController');
const refController = require('../routes/refController');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/bbs', bbsController(app));
app.use('/ref', refController(app));

// Mock response object
const mockRes = () => {
    const res = {};
    res.send = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

async function runTests() {
    try {
        console.log('Testing /bbs/getContent optimization...');

        let req = { query: { b_id: 1 } };
        let res = mockRes();

        // Find the route handler for GET /getContent
        const bbsRouter = bbsController(app);
        const getContentRoute = bbsRouter.stack.find(layer => layer.route && layer.route.path === '/getContent' && layer.route.methods.get);

        if (!getContentRoute) {
            throw new Error("Could not find GET /getContent route in bbsController");
        }

        findAndCountAllCalled = 0;
        findAllCalled = 0;

        // Execute the handler
        await getContentRoute.route.stack[0].handle(req, res, () => {});

        assert.strictEqual(findAndCountAllCalled, 0, "tbl_bbs.findAndCountAll should NOT be called. Expected optimization was missing.");
        assert.strictEqual(findAllCalled, 1, "tbl_bbs.findAll SHOULD be called.");
        assert(res.data && res.data.BBS_LIST, "Response should contain BBS_LIST");

        console.log('Testing /ref/getContent optimization...');

        req = { query: { b_id: 1 } };
        res = mockRes();

        // Find the route handler for GET /getContent
        const refRouter = refController(app);
        const refGetContentRoute = refRouter.stack.find(layer => layer.route && layer.route.path === '/getContent' && layer.route.methods.get);

        if (!refGetContentRoute) {
            throw new Error("Could not find GET /getContent route in refController");
        }

        findAndCountAllCalled = 0;
        findAllCalled = 0;

        // Execute the handler
        await refGetContentRoute.route.stack[0].handle(req, res, () => {});

        assert.strictEqual(findAndCountAllCalled, 0, "tbl_ref.findAndCountAll should NOT be called. Expected optimization was missing.");
        assert.strictEqual(findAllCalled, 1, "tbl_ref.findAll SHOULD be called.");
        assert(res.data && res.data.REF_LIST, "Response should contain REF_LIST");

        console.log('✅ test_getcontent_performance passed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ test_getcontent_performance failed:', err.message);
        process.exit(1);
    }
}

runTests();
