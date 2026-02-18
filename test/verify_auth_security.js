const assert = require('assert');
const path = require('path');
const express = require('express'); // Use real express for Router structure

// Mock Sequelize and Models
const mockModels = {
  tbl_bbs: {
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    destroy: () => Promise.resolve({}),
    count: () => Promise.resolve(0),
    findOne: () => Promise.resolve({ b_count: 0, b_text: '' }),
    findAndCountAll: () => Promise.resolve({ rows: [], count: 0 })
  },
  sequelize: {
    Op: { like: 'like' }
  }
};

// Mock require cache to inject mock models
const modelsPath = path.resolve(__dirname, '../models');
require.cache[modelsPath] = {
  id: modelsPath,
  filename: modelsPath,
  loaded: true,
  exports: mockModels
};

// Mock express-paginate
try {
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
} catch (e) {
    // Ignore if not found
}

// Helper to capture routes
const routes = [];
const appMock = {
    use: () => {}, // Mock app.use
    get: () => {},
    post: () => {},
    all: () => {}
};

// Load Controller
let router;
try {
    const bbsControllerFactory = require('../routes/bbsController');
    router = bbsControllerFactory(appMock);
} catch (e) {
    console.error("Error loading controller:", e);
    process.exit(1);
}

// Extract routes from Router
if (router && router.stack) {
    router.stack.forEach(layer => {
        if (layer.route) {
            const path = layer.route.path;
            if (layer.route.methods && layer.route.methods.post) {
                routes.push({
                    path: path,
                    handlers: layer.route.stack.map(h => h.handle)
                });
            }
        }
    });
}

// Test Runner
async function runTests() {
    const sensitiveRoutes = [
        '/insert', '/update', '/delete',
        '/notice/insert', '/notice/update', '/notice/delete'
    ];

    let passed = true;
    let allFound = true;

    for (const routePath of sensitiveRoutes) {
        const route = routes.find(r => r.path === routePath);
        if (!route) {
            console.error(`Route ${routePath} not found!`);
            allFound = false;
            continue;
        }

        // Simulate unauthenticated request
        const req = {
            body: {},
            session: { isAdmin: false }, // Unauthenticated
            query: {}
        };
        const res = {
            statusCode: 200,
            status: function(code) { this.statusCode = code; return this; },
            send: function(msg) { this.body = msg; },
            render: function() {},
            redirect: function() {}
        };

        // Execute handlers chain
        try {
            // Simple recursive next() simulation
            let idx = 0;
            const next = async () => {
                if (idx < route.handlers.length) {
                    const handler = route.handlers[idx++];
                    await handler(req, res, next);
                }
            };
            await next();

        } catch (e) {
            // console.error(e);
        }

        // We expect status 401 or 403 for unauthorized access
        if (res.statusCode !== 401 && res.statusCode !== 403) {
            console.log(`❌ Route ${routePath} is NOT protected (Status: ${res.statusCode})`);
            passed = false;
        } else {
            console.log(`✅ Route ${routePath} is protected`);
        }
    }

    if (!allFound) {
         console.log("Security verification FAILED: Some routes were not found in the controller.");
         process.exit(1);
    }

    if (!passed) {
        console.log("Security verification FAILED: Unprotected routes found.");
        process.exit(1);
    } else {
        console.log("Security verification PASSED.");
    }
}

runTests();
