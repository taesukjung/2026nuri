const path = require('path');
const assert = require('assert');

// Simple spy implementation
function spy(fn) {
    const spied = function(...args) {
        spied.callCount++;
        spied.calls.push(args);
        if (fn) {
            try {
                return fn.apply(this, args);
            } catch (e) {
                return Promise.reject(e);
            }
        }
        return Promise.resolve();
    };
    spied.callCount = 0;
    spied.calls = [];
    return spied;
}

// Mock models
const mockTblRef = {
    create: spy(() => Promise.resolve({ id: 1 })),
    count: spy(() => Promise.resolve(0)),
    findAll: spy(() => Promise.resolve([])), // We expect this to be called
    findAndCountAll: spy(() => Promise.resolve({ count: 0, rows: [] })),
    update: spy(() => Promise.resolve([1])),
    destroy: spy(() => Promise.resolve(1))
};

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
        findAndCountAll: spy(() => Promise.resolve({ count: 0, rows: [] })),
        create: spy(() => Promise.resolve({})),
        count: spy(() => Promise.resolve(0)),
        findAll: spy(() => Promise.resolve([])),
        findOne: spy(() => Promise.resolve({})),
        update: spy(() => Promise.resolve()),
        destroy: spy(() => Promise.resolve())
    },
    tbl_ref: mockTblRef
};

// Inject mock into require cache
const modelsPath = path.resolve(__dirname, '../models/index.js');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: mockModels
};

// Also mock the directory import if needed
const modelsDirPath = path.resolve(__dirname, '../models');
// Note: require('../models') typically resolves to .../models/index.js
// so usually the first cache entry is sufficient if the path matches.
// But we can double check.

// Mock Express App
const mockApp = {
    use: spy(),
    get: spy(),
};

// Load the controller
const refControllerPath = path.resolve(__dirname, '../routes/refController.js');
// Ensure we reload it to use our mocks
delete require.cache[refControllerPath];
const refController = require('../routes/refController');
const router = refController(mockApp);

// Find the handler for POST /insert
function findHandler(router, method, path) {
    if (!router.stack) return null;
    const layer = router.stack.find(layer => {
        if (layer.route) {
            return layer.route.path === path && layer.route.methods[method.toLowerCase()];
        }
        return false;
    });
    return layer ? layer.route.stack[0].handle : null;
}

const insertHandler = findHandler(router, 'POST', '/insert');

if (!insertHandler) {
    console.error("Could not find POST /insert handler");
    process.exit(1);
}

// Mock request and response
const req = {
    body: {
        b_category: 'cat',
        b_date: '2023-10-27',
        b_sector: '1',
        b_client: 'client',
        b_text: 'text'
    }
};

const res = {
    redirect: spy((url) => {
        // console.log("Redirected to:", url);
    }),
    send: spy((body) => {
        // console.log("Sent:", body);
    }),
    render: spy((view, locals) => {
        // console.log("Rendered:", view);
    })
};

const next = spy();

// Execute handler
console.log("Executing /insert handler...");
insertHandler(req, res, next);

// Wait for async operations to complete
// Since we don't have access to the internal promise chain, we use a timeout.
// The operations are: create -> count -> findAll -> redirect
// All involve promises that resolve immediately in our mock.
setTimeout(() => {
    console.log("Checking spies...");
    console.log("create calls:", mockTblRef.create.callCount);
    console.log("count calls:", mockTblRef.count.callCount);
    console.log("findAll calls:", mockTblRef.findAll.callCount);

    if (mockTblRef.create.callCount === 0) {
        console.error("FAIL: create was not called");
        process.exit(1);
    }

    // EXPECTATION: findAll SHOULD NOT be called (after fix)
    if (mockTblRef.findAll.callCount === 0) {
        console.log("SUCCESS: findAll was NOT called (optimization verified).");
        process.exit(0);
    } else {
        console.error("FAIL: findAll WAS called (optimization NOT applied).");
        process.exit(1);
    }
}, 100);
