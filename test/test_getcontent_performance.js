const assert = require('assert');
const express = require('express');

// Mock Sequelize Models
let refFindAndCountAllCalls = 0;
let refFindAllCalls = 0;
let bbsFindAndCountAllCalls = 0;
let bbsFindAllCalls = 0;

const mockTblRef = {
    findAndCountAll: async (options) => {
        refFindAndCountAllCalls++;
        return { rows: [{ b_id: 1, content: 'Mock Ref Content' }], count: 1 };
    },
    findAll: async (options) => {
        refFindAllCalls++;
        return [{ b_id: 1, content: 'Mock Ref Content' }];
    }
};

const mockTblBbs = {
    findAndCountAll: async (options) => {
        bbsFindAndCountAllCalls++;
        return { rows: [{ b_id: 1, content: 'Mock BBS Content' }], count: 1 };
    },
    findAll: async (options) => {
        bbsFindAllCalls++;
        return [{ b_id: 1, content: 'Mock BBS Content' }];
    }
};

// Inject Mocks into require cache
const modelsPath = require.resolve('../models');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: {
        tbl_ref: mockTblRef,
        tbl_bbs: mockTblBbs
    }
};

// Mock express-paginate (used in refController)
const paginatePath = require.resolve('express-paginate');
require.cache[paginatePath] = {
    id: paginatePath,
    filename: paginatePath,
    loaded: true,
    exports: {
        middleware: (limit, maxLimit) => (req, res, next) => next(),
        getArrayPages: (req) => (limit, pageCount, currentPage) => []
    }
};

const refController = require('../routes/refController');
const bbsController = require('../routes/bbsController');

async function runTest() {
    console.log("Starting test_getcontent_performance...");

    // Set up app for refController
    const appRef = express();
    appRef.use('/ref', refController(appRef));

    // Set up app for bbsController
    const appBbs = express();
    appBbs.use('/bbs', bbsController(appBbs));

    const serverRef = appRef.listen(0);
    const serverBbs = appBbs.listen(0);

    const portRef = serverRef.address().port;
    const portBbs = serverBbs.address().port;

    try {
        // Test refController /getContent
        const resRef = await fetch(`http://127.0.0.1:${portRef}/ref/getContent?b_id=1`);
        const jsonRef = await resRef.json();

        // Assertions for refController
        assert.strictEqual(refFindAndCountAllCalls, 0, 'tbl_ref.findAndCountAll should NOT be called in /getContent');
        assert.strictEqual(refFindAllCalls, 1, 'tbl_ref.findAll should be called exactly once in /getContent');
        assert(Array.isArray(jsonRef.REF_LIST), 'Response REF_LIST should be an array directly returned by findAll');
        console.log("✅ refController /getContent performance test passed!");

        // Test bbsController /getContent
        const resBbs = await fetch(`http://127.0.0.1:${portBbs}/bbs/getContent?b_id=1`);
        const jsonBbs = await resBbs.json();

        // Assertions for bbsController
        assert.strictEqual(bbsFindAndCountAllCalls, 0, 'tbl_bbs.findAndCountAll should NOT be called in /getContent');
        assert.strictEqual(bbsFindAllCalls, 1, 'tbl_bbs.findAll should be called exactly once in /getContent');
        assert(Array.isArray(jsonBbs.BBS_LIST), 'Response BBS_LIST should be an array directly returned by findAll');
        console.log("✅ bbsController /getContent performance test passed!");

    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    } finally {
        serverRef.close();
        serverBbs.close();
    }
}

runTest();
