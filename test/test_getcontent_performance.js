const assert = require('assert');
const express = require('express');

// We need to test routes without the real DB. We mock the models.
const mockTblBbs = {
    findAll: async (options) => {
        mockTblBbs.findAllCalled = true;
        return [{ b_id: 1, title: 'test bbs' }];
    },
    findAndCountAll: async (options) => {
        mockTblBbs.findAndCountAllCalled = true;
        return { count: 1, rows: [{ b_id: 1, title: 'test bbs' }] };
    },
    findAllCalled: false,
    findAndCountAllCalled: false,
};

const mockTblRef = {
    findAll: async (options) => {
        mockTblRef.findAllCalled = true;
        return [{ b_id: 2, title: 'test ref' }];
    },
    findAndCountAll: async (options) => {
        mockTblRef.findAndCountAllCalled = true;
        return { count: 1, rows: [{ b_id: 2, title: 'test ref' }] };
    },
    findAllCalled: false,
    findAndCountAllCalled: false,
};

// Override the require cache for models BEFORE loading controllers
require.cache[require.resolve('../models')] = {
    exports: {
        tbl_bbs: mockTblBbs,
        tbl_ref: mockTblRef
    }
};

const bbsController = require('../routes/bbsController');
const refController = require('../routes/refController');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize controllers
const bbsRouter = bbsController(app);
const refRouter = refController(app);

app.use('/bbs', bbsRouter);
app.use('/ref', refRouter);


async function runTests() {
    let server;
    try {
        server = app.listen(0); // Random port
        const port = server.address().port;

        // --- Test 1: bbsController /getContent ---
        console.log('Testing /bbs/getContent ...');
        mockTblBbs.findAllCalled = false;
        mockTblBbs.findAndCountAllCalled = false;

        const res1 = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
        const body1 = await res1.json();

        assert.strictEqual(res1.status, 200, 'Expected status 200');
        assert.ok(body1.BBS_LIST, 'Expected BBS_LIST in response');
        assert.strictEqual(body1.BBS_LIST[0].title, 'test bbs', 'Expected mocked data');

        assert.ok(mockTblBbs.findAllCalled, 'findAll should have been called');
        assert.strictEqual(mockTblBbs.findAndCountAllCalled, false, 'findAndCountAll should NOT be called (Performance Optimization)');

        // --- Test 2: refController /getContent ---
        console.log('Testing /ref/getContent ...');
        mockTblRef.findAllCalled = false;
        mockTblRef.findAndCountAllCalled = false;

        const res2 = await fetch(`http://localhost:${port}/ref/getContent?b_id=2`);
        const body2 = await res2.json();

        assert.strictEqual(res2.status, 200, 'Expected status 200');
        assert.ok(body2.REF_LIST, 'Expected REF_LIST in response');
        assert.strictEqual(body2.REF_LIST[0].title, 'test ref', 'Expected mocked data');

        assert.ok(mockTblRef.findAllCalled, 'findAll should have been called');
        assert.strictEqual(mockTblRef.findAndCountAllCalled, false, 'findAndCountAll should NOT be called (Performance Optimization)');


        console.log('✅ All performance tests passed!');

    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exitCode = 1;
    } finally {
        if (server) {
            server.close();
        }
        // Cleanup require cache
        delete require.cache[require.resolve('../models')];
    }
}

runTests();
