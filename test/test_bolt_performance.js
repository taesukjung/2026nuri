const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

async function testPerformance() {
    console.log("Starting performance tests for /getContent and /insert...");
    let callCounts = {
        refFindAndCountAll: 0,
        refFindAll: 0,
        refCount: 0,
        bbsFindAndCountAll: 0,
        bbsFindAll: 0,
        bbsCount: 0
    };

    // Mock models
    const mockModels = {
        tbl_ref: {
            findAndCountAll: async (options) => {
                callCounts.refFindAndCountAll++;
                return { count: 1, rows: [{ id: 1, b_category: 'ref_test' }] };
            },
            findAll: async (options) => {
                callCounts.refFindAll++;
                return [{ id: 1, b_category: 'ref_test' }];
            },
            count: async (options, callback) => {
                callCounts.refCount++;
                if (callback) callback(1);
                return 1;
            },
            create: async (data) => {
                return { id: 1, ...data };
            }
        },
        tbl_bbs: {
            findAndCountAll: async (options) => {
                callCounts.bbsFindAndCountAll++;
                return { count: 1, rows: [{ id: 1, b_category: 'bbs_test' }] };
            },
            findAll: async (options) => {
                callCounts.bbsFindAll++;
                return [{ id: 1, b_category: 'bbs_test' }];
            },
            count: async (options, callback) => {
                callCounts.bbsCount++;
                if (callback) callback(1);
                return 1;
            },
            create: async (data) => {
                return { id: 1, ...data };
            }
        }
    };

    // Inject mocks into require cache
    require.cache[require.resolve('../models')] = {
        exports: mockModels
    };

    const refController = require('../routes/refController');
    const bbsController = require('../routes/bbsController');

    const app = express();
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Minimal EJS setup for res.render in tests
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'html');
    app.engine('html', require('ejs').renderFile);

    app.use('/ref', refController(app));
    app.use('/bbs', bbsController(app));

    const server = app.listen(0);
    const port = server.address().port;

    const request = require('http').request;

    const makeRequest = (path, method = 'GET', data = null) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: port,
                path: path,
                method: method,
                headers: {}
            };

            if (data) {
                const postData = JSON.stringify(data);
                options.headers['Content-Type'] = 'application/json';
                options.headers['Content-Length'] = Buffer.byteLength(postData);
            }

            const req = request(options, (res) => {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => {
                    resolve({ statusCode: res.statusCode, body });
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    };

    try {
        // Test ref /getContent
        await makeRequest('/ref/getContent?b_id=1');
        assert.strictEqual(callCounts.refFindAndCountAll, 0, "refController /getContent should NOT call findAndCountAll");
        assert.strictEqual(callCounts.refFindAll, 1, "refController /getContent should call findAll");

        // Test ref /insert
        await makeRequest('/ref/insert', 'POST', { b_category: 'test' });
        assert.strictEqual(callCounts.refCount, 0, "refController /insert should NOT call count");
        // findAll is called 1 time in /getContent, so it should remain 1 after /insert
        assert.strictEqual(callCounts.refFindAll, 1, "refController /insert should NOT call redundant findAll");

        // Test bbs /getContent
        await makeRequest('/bbs/getContent?b_id=1');
        assert.strictEqual(callCounts.bbsFindAndCountAll, 0, "bbsController /getContent should NOT call findAndCountAll");
        assert.strictEqual(callCounts.bbsFindAll, 1, "bbsController /getContent should call findAll");

        // Test bbs /insert
        await makeRequest('/bbs/insert', 'POST', { b_category: 'test' });
        assert.strictEqual(callCounts.bbsCount, 0, "bbsController /insert should NOT call count");

        console.log("All performance tests passed successfully!");
    } catch (err) {
        console.error("Performance test failed:", err);
        process.exitCode = 1;
    } finally {
        server.close();
        delete require.cache[require.resolve('../models')];
    }
}

testPerformance();
