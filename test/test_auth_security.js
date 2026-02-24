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
     findOne: () => Promise.resolve({ w_passwd: 'password' }) // Mock correct password
  }
};

// Inject mock into require cache
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
      const port = server.address().port;
      resolve(port);
    });
    server.on('error', reject);
  });
}

function postRequest(port, path, data, cookie) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(data);
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    // 1. Try to access /bbs/insert without session
    console.log('Test 1: POST /bbs/insert without session');
    const res1 = await postRequest(port, '/bbs/insert', { b_subject: 'test' });
    if (res1.statusCode === 401) {
      console.log('PASS: Got 401 Unauthorized');
    } else {
      console.error(`FAIL: Expected 401, got ${res1.statusCode}`);
      process.exit(1);
    }

    // 2. Login to get session
    console.log('Test 2: Login via /auth/check/bbs');
    const res2 = await postRequest(port, '/auth/check/bbs', { w_passwd: 'password' });
    // Check if we got a cookie
    const cookies = res2.headers['set-cookie'];
    if (cookies && cookies.length > 0) {
      console.log('PASS: Got cookie');
    } else {
      console.error('FAIL: No cookie received');
      process.exit(1);
    }
    const sessionCookie = cookies[0].split(';')[0];

    // 3. Try to access /bbs/insert WITH session
    console.log('Test 3: POST /bbs/insert with session');
    const res3 = await postRequest(port, '/bbs/insert', { b_subject: 'test' }, sessionCookie);
    // Expect 200 (render) or 302 (redirect) depending on implementation.
    // bbsController renders 'contact/contact1.html' on success, which returns 200.
    if (res3.statusCode === 200) {
        console.log('PASS: Got 200 OK (Authorized)');
    } else {
        console.error(`FAIL: Expected 200, got ${res3.statusCode}`);
        // console.log(res3.body);
        process.exit(1);
    }

    server.close();
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error);
    server.close();
    process.exit(1);
  }
}

runTest();
