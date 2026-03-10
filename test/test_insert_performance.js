const assert = require('assert');
const express = require('express');
const request = require('http');

let createCalled = false;
let countCalled = false;
let findAllCalled = false;

// Mock models
const mockModels = {
    tbl_bbs: {
        create: () => {
            createCalled = true;
            return Promise.resolve({ b_id: 1, title: 'test' });
        },
        count: () => {
            countCalled = true;
            return Promise.resolve(1);
        },
        findAll: () => {
            findAllCalled = true;
            return Promise.resolve([{ b_id: 1, title: 'test' }]);
        }
    },
    tbl_ref: {
        create: () => {
            createCalled = true;
            return Promise.resolve({ b_id: 1, title: 'test' });
        },
        count: () => {
            countCalled = true;
            return Promise.resolve(1);
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
app.use(express.json());
// Mock rendering/redirecting to prevent failures without view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    res.render = () => res.send('RENDERED');
    res.redirect = () => res.send('REDIRECTED');
    next();
});

const bbsController = require('../routes/bbsController')(app);
const refController = require('../routes/refController')(app);

app.use('/bbs', bbsController);
app.use('/ref', refController);

const server = app.listen(0, () => {
    const port = server.address().port;

    // Test /bbs/insert
    const options1 = {
        hostname: 'localhost',
        port: port,
        path: '/bbs/insert',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req1 = request.request(options1, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                assert.strictEqual(createCalled, true, "tbl_bbs.create should be called in /bbs/insert");
                assert.strictEqual(countCalled, false, "tbl_bbs.count should NOT be called in /bbs/insert");

                // Reset flags
                createCalled = false;
                countCalled = false;
                findAllCalled = false;

                // Test /ref/insert
                const options2 = {
                    hostname: 'localhost',
                    port: port,
                    path: '/ref/insert',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const req2 = request.request(options2, (res) => {
                    let data2 = '';
                    res.on('data', chunk => data2 += chunk);
                    res.on('end', () => {
                        try {
                            assert.strictEqual(createCalled, true, "tbl_ref.create should be called in /ref/insert");
                            assert.strictEqual(countCalled, false, "tbl_ref.count should NOT be called in /ref/insert");
                            assert.strictEqual(findAllCalled, false, "tbl_ref.findAll should NOT be called in /ref/insert");

                            console.log("✅ test_insert_performance passed.");
                            server.close();
                            process.exit(0);
                        } catch(e) {
                            console.error(e);
                            server.close();
                            process.exit(1);
                        }
                    });
                });
                req2.write(JSON.stringify({b_category: 'test'}));
                req2.end();

            } catch(e) {
                console.error(e);
                server.close();
                process.exit(1);
            }
        });
    });
    req1.write(JSON.stringify({b_category: 'test'}));
    req1.end();
});
