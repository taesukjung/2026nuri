const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('views', require('path').join(__dirname, '../views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Mock models
let findAndCountAllCalled = false;
let countCalled = false;
let findAllCalled = false;

const mockModel = {
  create: () => Promise.resolve({}),
  findAndCountAll: () => {
    findAndCountAllCalled = true;
    return Promise.resolve({ count: 1, rows: [{ id: 1 }] });
  },
  findAll: () => {
    findAllCalled = true;
    return Promise.resolve([{ id: 1 }]);
  },
  count: () => {
    countCalled = true;
    return Promise.resolve(1);
  }
};

require.cache[require.resolve('../models')] = {
  exports: {
    tbl_ref: mockModel,
    tbl_bbs: mockModel
  }
};

const refRouter = require('../routes/refController')(app);
const bbsRouter = require('../routes/bbsController')(app);

app.use('/ref', refRouter);
app.use('/bbs', bbsRouter);

const server = app.listen(0);

async function testPerformance() {
  const port = server.address().port;
  let testFailed = false;

  try {
    // Test 1: refController /insert should not call count or findAll
    findAndCountAllCalled = false;
    countCalled = false;
    findAllCalled = false;
    let res = await fetch(`http://localhost:${port}/ref/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        b_category: 'test', b_date: '2023-01-01', b_sector: '1', b_client: 'test', b_text: 'test'
      })
    });
    // the route redirects, so we just wait for it to finish
    await res.text();
    assert.strictEqual(countCalled, false, 'refController /insert should not call count()');
    assert.strictEqual(findAllCalled, false, 'refController /insert should not call findAll()');

    // Test 2: bbsController /insert should not call count
    findAndCountAllCalled = false;
    countCalled = false;
    findAllCalled = false;
    res = await fetch(`http://localhost:${port}/bbs/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        b_category: 'test', b_date: '2023-01-01', b_subject: 'test', b_text: 'test'
      })
    });
    await res.text();
    assert.strictEqual(countCalled, false, 'bbsController /insert should not call count()');

    // Test 3: refController /getContent should use findAll, not findAndCountAll
    findAndCountAllCalled = false;
    countCalled = false;
    findAllCalled = false;
    res = await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);
    const refContent = await res.json();
    assert.strictEqual(findAndCountAllCalled, false, 'refController /getContent should not call findAndCountAll()');
    assert.strictEqual(findAllCalled, true, 'refController /getContent should call findAll()');
    assert.ok(Array.isArray(refContent.REF_LIST), 'REF_LIST should be an array directly returned from findAll');

    // Test 4: bbsController /getContent should use findAll, not findAndCountAll
    findAndCountAllCalled = false;
    countCalled = false;
    findAllCalled = false;
    res = await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
    const bbsContent = await res.json();
    assert.strictEqual(findAndCountAllCalled, false, 'bbsController /getContent should not call findAndCountAll()');
    assert.strictEqual(findAllCalled, true, 'bbsController /getContent should call findAll()');
    assert.ok(Array.isArray(bbsContent.BBS_LIST), 'BBS_LIST should be an array directly returned from findAll');

    console.log('All performance regression tests passed.');
  } catch (err) {
    console.error('Performance test failed:', err);
    testFailed = true;
  } finally {
    server.close();
    delete require.cache[require.resolve('../models')];
    if (testFailed) {
      process.exit(1);
    }
  }
}

testPerformance();