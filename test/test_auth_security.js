const assert = require('assert');
const http = require('http');
const path = require('path');
const querystring = require('querystring');

// Mock models/index.js
const modelsPath = path.resolve(__dirname, '../models/index.js');
const mockModels = {
  sequelize: {
    sync: () => Promise.resolve(),
    Op: { like: 'like' },
    literal: (val) => val,
    import: () => {}
  },
  Sequelize: {
    Op: { like: 'like' }
  },
  tbl_bbs: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    findOne: () => Promise.resolve({}),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_ref: {
    findAndCountAll: () => Promise.resolve({ count: 0, rows: [] }),
    create: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findAll: () => Promise.resolve([]),
    update: () => Promise.resolve(),
    destroy: () => Promise.resolve()
  },
  tbl_auth: {
     findOne: () => Promise.resolve({ w_passwd: 'password123' })
  }
};

require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels
};

const app = require('../app');
const server = http.createServer(app);

function listenOnFreePort(server) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
    server.on('error', reject);
  });
}

function makeRequest(port, method, path, postData, cookie) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        if (cookie) {
            options.headers['Cookie'] = cookie;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function runTest() {
    try {
        const port = await listenOnFreePort(server);
        console.log(`Test server running on port ${port}`);

        // Test 1: Unauthorized access to /bbs/insert
        console.log('Test 1: Unauthorized access to /bbs/insert');
        let res = await makeRequest(port, 'POST', '/bbs/insert', querystring.stringify({ b_subject: 'test' }));
        assert.strictEqual(res.statusCode, 401, 'Should return 401 Unauthorized');
        console.log('Passed: Unauthorized access blocked.');

        // Test 2: Login with incorrect password
        console.log('Test 2: Login with incorrect password');
        res = await makeRequest(port, 'POST', '/auth/check/bbs', querystring.stringify({ w_passwd: 'wrong' }));
        assert.strictEqual(res.statusCode, 200, 'Should return 200 (render view)');
        // In this case, no session cookie should be set/updated effectively for admin, or at least we can check if we can access protected route.
        // Actually express-session might set a cookie anyway (session ID), but isAdmin won't be true.
        let cookie = res.headers['set-cookie'];
        // If we use that cookie, we should still fail.
        let sessionCookie = cookie ? cookie[0].split(';')[0] : null;

        if (sessionCookie) {
             console.log('Testing with session cookie from failed login...');
             res = await makeRequest(port, 'POST', '/bbs/insert', querystring.stringify({ b_subject: 'test' }), sessionCookie);
             assert.strictEqual(res.statusCode, 401, 'Should return 401 even with session cookie (if login failed)');
             console.log('Passed: Failed login does not grant access.');
        }


        // Test 3: Login with correct password
        console.log('Test 3: Login with correct password');
        res = await makeRequest(port, 'POST', '/auth/check/bbs', querystring.stringify({ w_passwd: 'password123' }));
        assert.strictEqual(res.statusCode, 200, 'Should return 200 (render write view)');

        cookie = res.headers['set-cookie'];
        assert.ok(cookie, 'Should have set-cookie header');
        sessionCookie = cookie[0].split(';')[0];
        console.log('Passed: Login successful, cookie received.');

        // Test 4: Authorized access to /bbs/insert
        console.log('Test 4: Authorized access to /bbs/insert');
        res = await makeRequest(port, 'POST', '/bbs/insert', querystring.stringify({ b_subject: 'test', b_category: 'test' }), sessionCookie);
        // It renders contact/contact1.html on success (status 200) or redirects?
        // Code: res.render('contact/contact1.html'); -> 200
        assert.strictEqual(res.statusCode, 200, 'Should return 200 (success render)');
        console.log('Passed: Authorized access allowed.');

        console.log('All security tests passed!');
        server.close();
        process.exit(0);

    } catch (error) {
        console.error('Test failed:', error);
        server.close();
        process.exit(1);
    }
}

runTest();
