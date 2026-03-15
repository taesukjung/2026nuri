const express = require('express');
const assert = require('assert');
const http = require('http');
const models = require('../models');

// Mock objects to intercept Sequelize calls
let bbsCounts = { count: 0, findAll: 0, findAndCountAll: 0, create: 0 };
let refCounts = { count: 0, findAll: 0, findAndCountAll: 0, create: 0 };

// Helper to make mock models
function mockModel(targetCounts, mockName) {
    return {
        create: (data) => {
            targetCounts.create++;
            return Promise.resolve(data);
        },
        count: () => {
            targetCounts.count++;
            return Promise.resolve(1);
        },
        findAll: () => {
            targetCounts.findAll++;
            return Promise.resolve([{ id: 1 }]);
        },
        findAndCountAll: () => {
            targetCounts.findAndCountAll++;
            return Promise.resolve({ count: 1, rows: [{ id: 1 }] });
        }
    };
}

// Override models in require cache
models.tbl_bbs = mockModel(bbsCounts, 'tbl_bbs');
models.tbl_ref = mockModel(refCounts, 'tbl_ref');
require.cache[require.resolve('../models')].exports = models;

const bbsController = require('../routes/bbsController');
const refController = require('../routes/refController');

// Setup Express apps
const appBbs = express();
appBbs.use(express.urlencoded({ extended: true }));
appBbs.use(express.json());

// mock ejs view engine properly
appBbs.set('views', __dirname);
appBbs.set('view engine', 'html');
appBbs.engine('html', require('ejs').renderFile);

appBbs.use('/bbs', bbsController(appBbs));

const appRef = express();
appRef.use(express.urlencoded({ extended: true }));
appRef.use(express.json());

// mock ejs view engine properly
appRef.set('views', __dirname);
appRef.set('view engine', 'html');
appRef.engine('html', require('ejs').renderFile);

appRef.use('/ref', refController(appRef));

// Create mock ejs file
const fs = require('fs');
const path = require('path');
const ejsDir = path.join(__dirname, 'contact');
const ejsFile = path.join(ejsDir, 'contact1.html');
if (!fs.existsSync(ejsDir)) fs.mkdirSync(ejsDir);
fs.writeFileSync(ejsFile, '<h1>Mock Contact</h1>');

// Helper for making requests
function makeRequest(app, method, path, data) {
    return new Promise((resolve, reject) => {
        const server = app.listen(0, () => {
            const port = server.address().port;
            const options = {
                hostname: '127.0.0.1',
                port: port,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => responseData += chunk);
                res.on('end', () => {
                    server.close();
                    resolve({ status: res.statusCode, data: responseData });
                });
            });

            req.on('error', (e) => {
                server.close();
                reject(e);
            });

            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    });
}

async function runTests() {
    console.log("Starting performance regression tests...");

    // 1. Test BBS /insert
    await makeRequest(appBbs, 'POST', '/bbs/insert', { b_category: 'test', b_subject: 'test subject', b_text: 'test text' });

    console.log(`BBS Insert Test: create=${bbsCounts.create}, count=${bbsCounts.count}, findAll=${bbsCounts.findAll}`);
    assert.strictEqual(bbsCounts.create, 1, 'tbl_bbs.create should be called');
    assert.strictEqual(bbsCounts.count, 0, 'tbl_bbs.count should NOT be called during insert (Optimization Absent!)');
    assert.strictEqual(bbsCounts.findAll, 0, 'tbl_bbs.findAll should NOT be called during insert (Optimization Absent!)');

    // 2. Test REF /insert
    await makeRequest(appRef, 'POST', '/ref/insert', { b_category: 'test', b_sector: '1', b_client: 'client', b_text: 'text' });

    console.log(`REF Insert Test: create=${refCounts.create}, count=${refCounts.count}, findAll=${refCounts.findAll}`);
    assert.strictEqual(refCounts.create, 1, 'tbl_ref.create should be called');
    assert.strictEqual(refCounts.count, 0, 'tbl_ref.count should NOT be called during insert (Optimization Absent!)');
    assert.strictEqual(refCounts.findAll, 0, 'tbl_ref.findAll should NOT be called during insert (Optimization Absent!)');

    // 3. Test BBS /getContent
    bbsCounts.findAll = 0; // reset
    await makeRequest(appBbs, 'GET', '/bbs/getContent?b_id=1');

    console.log(`BBS getContent Test: findAndCountAll=${bbsCounts.findAndCountAll}, findAll=${bbsCounts.findAll}`);
    assert.strictEqual(bbsCounts.findAndCountAll, 0, 'tbl_bbs.findAndCountAll should NOT be called (Optimization Absent!)');
    assert.strictEqual(bbsCounts.findAll, 1, 'tbl_bbs.findAll SHOULD be called instead of findAndCountAll');

    // 4. Test REF /getContent
    refCounts.findAll = 0; // reset
    await makeRequest(appRef, 'GET', '/ref/getContent?b_id=1');

    console.log(`REF getContent Test: findAndCountAll=${refCounts.findAndCountAll}, findAll=${refCounts.findAll}`);
    assert.strictEqual(refCounts.findAndCountAll, 0, 'tbl_ref.findAndCountAll should NOT be called (Optimization Absent!)');
    assert.strictEqual(refCounts.findAll, 1, 'tbl_ref.findAll SHOULD be called instead of findAndCountAll');

    console.log("✅ All performance regression tests passed!");
    fs.unlinkSync(ejsFile);
    fs.rmdirSync(ejsDir);
}

runTests().catch(err => {
    console.error("Test failed:", err);
    if(fs.existsSync(ejsFile)) fs.unlinkSync(ejsFile);
    if(fs.existsSync(ejsDir)) fs.rmdirSync(ejsDir);
    process.exit(1);
});
