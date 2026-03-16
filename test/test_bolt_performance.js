const assert = require('assert');
const express = require('express');
const http = require('http');

let methodCalls = {
    ref_findAndCountAll: 0,
    ref_findAll: 0,
    ref_count: 0,
    ref_create: 0,
    bbs_findAndCountAll: 0,
    bbs_findAll: 0,
    bbs_count: 0,
    bbs_create: 0
};

// Mock models
const mockModels = {
    tbl_ref: {
        findAndCountAll: async () => { methodCalls.ref_findAndCountAll++; return { rows: [], count: 0 }; },
        findAll: async () => { methodCalls.ref_findAll++; return []; },
        count: async (opts, cb) => { methodCalls.ref_count++; if(cb) cb(0); return 0; },
        create: async () => { methodCalls.ref_create++; return {}; },
        update: async () => { return {}; },
        destroy: async () => { return {}; }
    },
    tbl_bbs: {
        findAndCountAll: async () => { methodCalls.bbs_findAndCountAll++; return { rows: [], count: 0 }; },
        findAll: async () => { methodCalls.bbs_findAll++; return []; },
        count: async (opts, cb) => { methodCalls.bbs_count++; if(cb) cb(0); return 0; },
        create: async () => { methodCalls.bbs_create++; return {}; },
        update: async () => { return {}; },
        destroy: async () => { return {}; }
    }
};

// Mock the models module
require.cache[require.resolve('../models')] = {
    id: require.resolve('../models'),
    filename: require.resolve('../models'),
    loaded: true,
    exports: mockModels
};

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up simple view engine for testing res.render
app.set('views', __dirname);
app.set('view engine', 'html');
app.engine('html', (path, options, callback) => callback(null, 'mock html'));
// mock out render completely to not fail if views are missing
app.use((req, res, next) => {
    res.render = () => res.send('mock render');
    next();
});

// Load routes
const refRouter = require('../routes/refController')(app);
const bbsRouter = require('../routes/bbsController')(app);

app.use('/ref', refRouter);
app.use('/bbs', bbsRouter);

const server = app.listen(0, async () => {
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;

    try {
        console.log("Testing /ref/insert...");
        await fetch(`${baseUrl}/ref/insert`, {
            method: 'POST',
            body: new URLSearchParams({
                b_category: 'test',
                b_date: '2023-10-10',
                b_sector: '1',
                b_client: 'client',
                b_text: 'text'
            })
        });

        assert.strictEqual(methodCalls.ref_create, 1, "ref.create should be called");
        assert.strictEqual(methodCalls.ref_count, 0, "ref.count should NOT be called");
        assert.strictEqual(methodCalls.ref_findAll, 0, "ref.findAll should NOT be called in /insert");

        console.log("Testing /bbs/insert...");
        await fetch(`${baseUrl}/bbs/insert`, {
            method: 'POST',
            body: new URLSearchParams({
                b_category: 'test',
                b_date: '2023-10-10',
                b_subject: 'subject',
                b_text: 'text'
            })
        });

        assert.strictEqual(methodCalls.bbs_create, 1, "bbs.create should be called");
        assert.strictEqual(methodCalls.bbs_count, 0, "bbs.count should NOT be called");

        console.log("Testing /ref/getContent...");
        const refGetContentRes = await fetch(`${baseUrl}/ref/getContent?b_id=1`);
        const refGetContentData = await refGetContentRes.json();

        assert.strictEqual(methodCalls.ref_findAndCountAll, 0, "ref.findAndCountAll should NOT be called");
        assert.strictEqual(methodCalls.ref_findAll, 1, "ref.findAll should be called");
        assert.ok(Array.isArray(refGetContentData.REF_LIST), "REF_LIST should be an array directly");

        console.log("Testing /bbs/getContent...");
        const bbsGetContentRes = await fetch(`${baseUrl}/bbs/getContent?b_id=1`);
        const bbsGetContentData = await bbsGetContentRes.json();

        assert.strictEqual(methodCalls.bbs_findAndCountAll, 0, "bbs.findAndCountAll should NOT be called");
        assert.strictEqual(methodCalls.bbs_findAll, 1, "bbs.findAll should be called");
        assert.ok(Array.isArray(bbsGetContentData.BBS_LIST), "BBS_LIST should be an array directly");

        console.log("All performance tests passed!");
    } catch (err) {
        console.error("Test failed:", err);
        process.exitCode = 1;
    } finally {
        server.close();
    }
});