const assert = require('assert');
const express = require('express');

async function runTest() {
    console.log("Setting up performance test for /getContent routes...");

    // Create a mock app
    const app = express();

    // Mock express-paginate
    const mockPaginate = {
        middleware: (limit, maxLimit) => (req, res, next) => next(),
        getArrayPages: (req) => (limit, pageCount, currentPage) => []
    };
    require.cache[require.resolve('express-paginate')] = {
        exports: mockPaginate
    };

    // Spies for Sequelize models
    const spies = {
        bbs_findAndCountAll: 0,
        bbs_findAll: 0,
        ref_findAndCountAll: 0,
        ref_findAll: 0
    };

    const mockModels = {
        tbl_bbs: {
            findAndCountAll: async (options) => {
                spies.bbs_findAndCountAll++;
                return { count: 1, rows: [{ id: 1, content: 'bbs_content' }] };
            },
            findAll: async (options) => {
                spies.bbs_findAll++;
                return [{ id: 1, content: 'bbs_content' }];
            }
        },
        tbl_ref: {
            findAndCountAll: async (options) => {
                spies.ref_findAndCountAll++;
                return { count: 1, rows: [{ id: 1, content: 'ref_content' }] };
            },
            findAll: async (options) => {
                spies.ref_findAll++;
                return [{ id: 1, content: 'ref_content' }];
            }
        }
    };

    require.cache[require.resolve('../models')] = {
        exports: mockModels
    };

    // Load controllers
    const bbsController = require('../routes/bbsController')(app);
    const refController = require('../routes/refController')(app);

    app.use('/bbs', bbsController);
    app.use('/ref', refController);

    const server = app.listen(0);
    const port = server.address().port;

    try {
        console.log("Testing GET /bbs/getContent...");
        const resBbs = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
        const dataBbs = await resBbs.json();

        console.log("Testing GET /ref/getContent...");
        const resRef = await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);
        const dataRef = await resRef.json();

        assert.strictEqual(spies.bbs_findAndCountAll, 0, "bbsController should NOT call findAndCountAll");
        assert.strictEqual(spies.bbs_findAll, 1, "bbsController should call findAll");
        assert.deepStrictEqual(dataBbs.BBS_LIST, [{ id: 1, content: 'bbs_content' }], "BBS_LIST payload should match");

        assert.strictEqual(spies.ref_findAndCountAll, 0, "refController should NOT call findAndCountAll");
        assert.strictEqual(spies.ref_findAll, 1, "refController should call findAll");
        assert.deepStrictEqual(dataRef.REF_LIST, [{ id: 1, content: 'ref_content' }], "REF_LIST payload should match");

        console.log("✅ Performance optimization verified: redundant findAndCountAll queries replaced with findAll.");
    } catch (err) {
        console.error("❌ Test failed:", err.message);
        process.exitCode = 1;
    } finally {
        server.close();
        delete require.cache[require.resolve('express-paginate')];
        delete require.cache[require.resolve('../models')];
    }
}

runTest();
