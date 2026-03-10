const assert = require('assert');
const express = require('express');
const request = require('http');

let findAndCountAllCalled = false;
let findAllCalled = false;

// Mock models
const mockModels = {
    tbl_bbs: {
        findAndCountAll: () => {
            findAndCountAllCalled = true;
            return Promise.resolve({ count: 1, rows: [{ b_id: 1, title: 'test' }] });
        },
        findAll: () => {
            findAllCalled = true;
            return Promise.resolve([{ b_id: 1, title: 'test' }]);
        }
    },
    tbl_ref: {
        findAndCountAll: () => {
            findAndCountAllCalled = true;
            return Promise.resolve({ count: 1, rows: [{ b_id: 1, title: 'test' }] });
        },
        findAll: () => {
            findAllCalled = true;
            return Promise.resolve([{ b_id: 1, title: 'test' }]);
        }
    }
};

// Inject mock into require.cache
require.cache[require.resolve('../models')] = {
    id: require.resolve('../models'),
    filename: require.resolve('../models'),
    loaded: true,
    exports: mockModels
};

const app = express();
const bbsController = require('../routes/bbsController')(app);
const refController = require('../routes/refController')(app);

app.use('/bbs', bbsController);
app.use('/ref', refController);

const server = app.listen(0, () => {
    const port = server.address().port;

    // Test /bbs/getContent
    request.get(`http://localhost:${port}/bbs/getContent?b_id=1`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                assert.strictEqual(findAndCountAllCalled, false, "tbl_bbs.findAndCountAll should not be called in /bbs/getContent");
                assert.strictEqual(findAllCalled, true, "tbl_bbs.findAll should be called in /bbs/getContent");
                const jsonData = JSON.parse(data);
                assert.ok(jsonData.BBS_LIST, "Response should contain BBS_LIST");
                assert.strictEqual(jsonData.BBS_LIST.length, 1);

                // Reset flags
                findAndCountAllCalled = false;
                findAllCalled = false;

                // Test /ref/getContent
                request.get(`http://localhost:${port}/ref/getContent?b_id=1`, (res) => {
                    let data2 = '';
                    res.on('data', chunk => data2 += chunk);
                    res.on('end', () => {
                        try {
                            assert.strictEqual(findAndCountAllCalled, false, "tbl_ref.findAndCountAll should not be called in /ref/getContent");
                            assert.strictEqual(findAllCalled, true, "tbl_ref.findAll should be called in /ref/getContent");
                            const jsonData2 = JSON.parse(data2);
                            assert.ok(jsonData2.REF_LIST, "Response should contain REF_LIST");
                            assert.strictEqual(jsonData2.REF_LIST.length, 1);

                            console.log("✅ test_getcontent_performance passed.");
                            server.close();
                            process.exit(0);
                        } catch(e) {
                            console.error(e);
                            server.close();
                            process.exit(1);
                        }
                    });
                });

            } catch(e) {
                console.error(e);
                server.close();
                process.exit(1);
            }
        });
    });
});
