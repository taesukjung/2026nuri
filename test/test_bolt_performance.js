const assert = require('assert');
const express = require('express');

// Mock models module using require.cache
const tbl_bbs = {
  create: async (data) => data,
  count: async () => 0,
  findAndCountAll: async () => ({ count: 0, rows: [] }),
  findAll: async () => [],
};

const tbl_ref = {
  create: async (data) => data,
  count: async () => 0,
  findAndCountAll: async () => ({ count: 0, rows: [] }),
  findAll: async () => [],
};

require.cache[require.resolve('../models')] = {
  exports: {
    tbl_bbs: tbl_bbs,
    tbl_ref: tbl_ref
  }
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup view engine for the mock app
app.set('views', require('path').join(__dirname, '../views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Load controllers
const bbsController = require('../routes/bbsController')(app);
const refController = require('../routes/refController')(app);

app.use('/bbs', bbsController);
app.use('/ref', refController);

let server;

// Add custom logic to capture redundant queries
let bbsCountCalled = false;
let refCountCalled = false;
let refFindAllInsertCalled = false;
let bbsFindAndCountAllCalled = false;
let refFindAndCountAllCalled = false;

// Override methods for tracking
tbl_bbs.count = async (options) => {
    bbsCountCalled = true;
    return 0;
};

tbl_ref.count = async (options) => {
    refCountCalled = true;
    return 0;
};

tbl_ref.findAll = async (options) => {
    // Only flag if findAll is called during an insert (which would have options.order)
    if (options && options.order) {
        refFindAllInsertCalled = true;
    }
    return [];
};

tbl_bbs.findAndCountAll = async (options) => {
    bbsFindAndCountAllCalled = true;
    return { count: 0, rows: [] };
};

tbl_ref.findAndCountAll = async (options) => {
    // We only care if it's called with b_id (which means it's getContent)
    // /list uses findAndCountAll but that's fine
    if (options && options.where && options.where.b_id) {
        refFindAndCountAllCalled = true;
    }
    return { count: 0, rows: [] };
};

async function runTests() {

  // start server
  await new Promise((resolve) => {
      server = app.listen(0, resolve);
  });
  const port = server.address().port;

  console.log("Starting tests...");

  // Insert tests (should not call count/findAll redundantly)

  await fetch(`http://localhost:${port}/bbs/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ b_category: 'test', b_date: '2023-10-27', b_subject: 'test subj', b_text: 'test text' })
  });

  await fetch(`http://localhost:${port}/ref/insert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ b_category: 'test', b_date: '2023-10-27', b_sector: '1', b_client: 'test client', b_text: 'test text' })
  });

  // GetContent tests (should use findAll instead of findAndCountAll)
  await fetch(`http://localhost:${port}/bbs/getContent?b_id=1`);
  await fetch(`http://localhost:${port}/ref/getContent?b_id=1`);

  console.log("Validating bbs insert");
  assert(!bbsCountCalled, "tbl_bbs.count() should NOT be called in /bbs/insert as it's redundant");
  console.log("Validating ref insert");
  assert(!refCountCalled, "tbl_ref.count() should NOT be called in /ref/insert as it's redundant");
  assert(!refFindAllInsertCalled, "tbl_ref.findAll() should NOT be called in /ref/insert if its result is discarded");
  console.log("Validating bbs getcontent");
  assert(!bbsFindAndCountAllCalled, "tbl_bbs.findAndCountAll() should NOT be called in /bbs/getContent, use findAll instead");
  console.log("Validating ref getcontent");
  assert(!refFindAndCountAllCalled, "tbl_ref.findAndCountAll() should NOT be called in /ref/getContent, use findAll instead");

  console.log("All tests passed!");
}

runTests()
    .then(() => {
        if (server) server.close();
        process.exit(0);
    })
    .catch(err => {
      console.error(err);
      if (server) server.close();
      process.exit(1);
    });
