const assert = require('assert');
const path = require('path');

// Mock dependencies
const mockTblRef = {
    create: async () => Promise.resolve({}),
    count: (opts, cb) => {
        if (typeof cb === 'function') cb(0);
        return Promise.resolve(0);
    },
    findAll: async () => Promise.resolve([]),
    findAndCountAll: async () => Promise.resolve({ count: 0, rows: [] })
};

// Spies
let findAllCalled = false;
mockTblRef.findAll = async () => {
    findAllCalled = true;
    return Promise.resolve([]);
};

// Mock require cache for models
const modelsPath = path.resolve(__dirname, '../models/index.js');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: {
        tbl_ref: mockTblRef,
        sequelize: { Op: {} }
    }
};

// Mock express-paginate
const paginatePath = require.resolve('express-paginate');
require.cache[paginatePath] = {
    id: paginatePath,
    filename: paginatePath,
    loaded: true,
    exports: {
        middleware: () => (req, res, next) => next(),
        getArrayPages: () => () => []
    }
};

// Mock Express
const express = require('express');
const app = express();
app.use = () => {}; // Mock app.use

// Helper to intercept Router
const originalRouter = express.Router;
const mockRouter = {
    get: function(path, ...handlers) { this.routes.get[path] = handlers; },
    post: function(path, ...handlers) { this.routes.post[path] = handlers; },
    all: function(path, ...handlers) { this.routes.all.push(handlers); },
    routes: { get: {}, post: {}, all: [] }
};

// We can't easily overwrite express.Router directly if it's a property of the exported function.
// But express.Router is a function attached to the main export.
// Let's try to mock the require of express entirely again, just to be safe.
const expressPath = require.resolve('express');
const originalExpress = require('express');

// We need a fresh require of refController to pick up mocks.
// So we must mock 'express' in the cache before requiring refController.

require.cache[expressPath] = {
    id: expressPath,
    filename: expressPath,
    loaded: true,
    exports: Object.assign(() => {}, originalExpress, {
        Router: () => mockRouter
    })
};

// Re-require controller
delete require.cache[require.resolve('../routes/refController')];
const refController = require('../routes/refController');

// Run the test
(async () => {
    console.log('Running Performance Test for /ref/insert...');

    // Initialize controller
    refController(app);

    const insertHandler = mockRouter.routes.post['/insert'][0];

    if (!insertHandler) {
        console.error('ERROR: Could not find /insert handler');
        process.exit(1);
    }

    const req = { body: {} };
    const res = {
        redirect: (url) => {
            console.log('Redirected to:', url);
        },
        render: () => {},
        send: () => {}
    };

    findAllCalled = false;
    await insertHandler(req, res, () => {});

    // Allow promises to settle
    await new Promise(resolve => setTimeout(resolve, 100));

    if (findAllCalled) {
        console.log('FAIL: findAll was called! Performance issue detected.');
        process.exit(1); // Fail
    } else {
        console.log('PASS: findAll was NOT called.');
        process.exit(0); // Pass
    }
})();
