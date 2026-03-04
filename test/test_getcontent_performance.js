const assert = require('assert');
const express = require('express');
const http = require('http');

let findAndCountAllCalled = false;
let findAllCalled = false;

// We need to mock the models that are require()d by the controllers
const mockBbsModel = {
    tbl_bbs: {
        findAndCountAll: () => {
            findAndCountAllCalled = true;
            return Promise.resolve({ count: 1, rows: [{ b_id: 1, b_subject: 'test' }] });
        },
        findAll: () => {
            findAllCalled = true;
            return Promise.resolve([{ b_id: 1, b_subject: 'test' }]);
        },
        findOne: () => Promise.resolve({ w_id: 'admin', w_passwd: 'password' })
    }
};

const mockRefModel = {
    tbl_ref: {
        findAndCountAll: () => {
            findAndCountAllCalled = true;
            return Promise.resolve({ count: 1, rows: [{ b_id: 1, b_text: 'test' }] });
        },
        findAll: () => {
            findAllCalled = true;
            return Promise.resolve([{ b_id: 1, b_text: 'test' }]);
        }
    }
};

const cacheKey = require.resolve('../models');
require.cache[cacheKey] = {
    id: cacheKey,
    filename: cacheKey,
    loaded: true,
    exports: { ...mockBbsModel, ...mockRefModel }
};

const app = express();
// The controllers export a function (app) => router
const bbsRouter = require('../routes/bbsController')(app);
const refRouter = require('../routes/refController')(app);

app.use('/bbs', bbsRouter);
app.use('/ref', refRouter);

async function runTests() {
    console.log("Starting /getContent performance tests...");

    const server = http.createServer(app);
    await new Promise(resolve => server.listen(0, resolve));
    const port = server.address().port;

    try {
        // Test BBS /getContent
        findAndCountAllCalled = false;
        findAllCalled = false;
        let res = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
        let data = await res.json();

        assert.ok(findAllCalled, "findAll should be called for /bbs/getContent");
        assert.ok(!findAndCountAllCalled, "findAndCountAll should NOT be called for /bbs/getContent");
        assert.ok(data.BBS_LIST && Array.isArray(data.BBS_LIST), "BBS_LIST should be an array");
        console.log("✅ BBS /getContent uses findAll instead of findAndCountAll");

        // Test REF /getContent
        findAndCountAllCalled = false;
        findAllCalled = false;
        res = await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);
        data = await res.json();

        assert.ok(findAllCalled, "findAll should be called for /ref/getContent");
        assert.ok(!findAndCountAllCalled, "findAndCountAll should NOT be called for /ref/getContent");
        assert.ok(data.REF_LIST && Array.isArray(data.REF_LIST), "REF_LIST should be an array");
        console.log("✅ REF /getContent uses findAll instead of findAndCountAll");

        console.log("All /getContent performance tests passed successfully.");
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    } finally {
        server.close();
    }
}

runTests();
