const assert = require('assert');
const express = require('express');

// Create mock models
const mockModels = {
    tbl_bbs: {
        findAll: async () => {
            mockModels.tbl_bbs.findAllCalled = true;
            return [{ b_id: 1, title: 'Test BBS' }];
        },
        findAndCountAll: async () => {
            mockModels.tbl_bbs.findAndCountAllCalled = true;
            return { count: 1, rows: [{ b_id: 1, title: 'Test BBS' }] };
        },
        findAllCalled: false,
        findAndCountAllCalled: false,
    },
    tbl_ref: {
        findAll: async () => {
            mockModels.tbl_ref.findAllCalled = true;
            return [{ b_id: 1, title: 'Test REF' }];
        },
        findAndCountAll: async () => {
            mockModels.tbl_ref.findAndCountAllCalled = true;
            return { count: 1, rows: [{ b_id: 1, title: 'Test REF' }] };
        },
        findAllCalled: false,
        findAndCountAllCalled: false,
    }
};

// Override the require cache for models
require.cache[require.resolve('../models')] = {
    exports: mockModels
};

const app = express();
const bbsController = require('../routes/bbsController')(app);
const refController = require('../routes/refController')(app);

app.use('/bbs', bbsController);
app.use('/ref', refController);

const server = app.listen(0, async () => {
    try {
        const port = server.address().port;

        // Test BBS /getContent
        const bbsRes = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
        const bbsData = await bbsRes.json();

        assert.ok(mockModels.tbl_bbs.findAllCalled, "BBS findAll should be called");
        assert.ok(!mockModels.tbl_bbs.findAndCountAllCalled, "BBS findAndCountAll should NOT be called");
        assert.deepStrictEqual(bbsData.BBS_LIST, [{ b_id: 1, title: 'Test BBS' }], "BBS response data matches");

        console.log("✅ BBS optimization verified.");

        // Test REF /getContent
        const refRes = await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);
        const refData = await refRes.json();

        assert.ok(mockModels.tbl_ref.findAllCalled, "REF findAll should be called");
        assert.ok(!mockModels.tbl_ref.findAndCountAllCalled, "REF findAndCountAll should NOT be called");
        assert.deepStrictEqual(refData.REF_LIST, [{ b_id: 1, title: 'Test REF' }], "REF response data matches");

        console.log("✅ REF optimization verified.");

        server.close();
        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err);
        server.close();
        process.exit(1);
    }
});
