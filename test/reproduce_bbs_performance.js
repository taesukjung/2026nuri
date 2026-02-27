const assert = require('assert');
const express = require('express');
const bodyParser = require('body-parser');

// Mock Sequelize and models
const mockFindAndCountAll = {
    then: function(callback) {
        callback({ rows: [{ b_id: 1, b_subject: 'Test Subject' }], count: 1 });
        return { catch: () => {} };
    }
};

const mockFindAll = {
    then: function(callback) {
        callback([{ b_id: 1, b_subject: 'Test Subject' }]);
        return { catch: () => {} };
    }
};

const mockCreate = {
    then: function(callback) {
        callback({ b_id: 1 });
        return { catch: () => {} };
    }
};

const mockUpdate = {
    then: function(callback) {
        callback([1]);
        return { catch: () => {} };
    }
};

const mockDestroy = {
    then: function(callback) {
        callback(1);
        return { catch: () => {} };
    }
};

const mockTblBbs = {
    findAndCountAll: (options) => {
        // Spy on this method call
        mockTblBbs.findAndCountAllCalledWith = options;
        return mockFindAndCountAll;
    },
    findAll: (options) => {
        // Spy on this method call
        mockTblBbs.findAllCalledWith = options;
        return mockFindAll;
    },
    create: (data) => {
        return mockCreate;
    },
    update: (data, options) => {
        return mockUpdate;
    },
    destroy: (options) => {
        return mockDestroy;
    },
    findOne: (options) => {
         return {
            then: (cb) => {
                cb({ b_id: 1, b_count: 0, b_text: 'text', update: () => ({ then: (cb2) => cb2() }) });
                return { catch: () => {} };
            }
         };
    }
};

const mockModels = {
    tbl_bbs: mockTblBbs
};

// Mock dependencies
const mockPaginate = {
    middleware: (limit, maxLimit) => (req, res, next) => next(),
    getArrayPages: (req) => (limit, pageCount, currentPage) => []
};

// Setup Express app with the controller
const app = express();
app.use(bodyParser.json());

// Inject mocks into require cache
const modelsPath = require.resolve('../models');
require.cache[modelsPath] = {
    id: modelsPath,
    filename: modelsPath,
    loaded: true,
    exports: mockModels
};

const bbsController = require('../routes/bbsController')(app);

// Simulate a request to the /getContent route
const req = {
    query: { b_id: 1 }
};
const res = {
    send: (data) => {
        // Verify response structure
        assert.ok(data.BBS_LIST, 'Response should contain BBS_LIST');
        assert.ok(Array.isArray(data.BBS_LIST), 'BBS_LIST should be an array');
        assert.strictEqual(data.BBS_LIST[0].b_subject, 'Test Subject', 'Response data should match mock');

        // Assertion: Check if findAll was called
        if (mockTblBbs.findAllCalledWith) {
             console.log('Test Passed: findAll was called.');
        } else if (mockTblBbs.findAndCountAllCalledWith) {
             console.error('Test Failed: findAndCountAll was called instead of findAll.');
             process.exit(1);
        } else {
             console.error('Test Failed: Neither findAll nor findAndCountAll was called.');
             process.exit(1);
        }
    }
};

// Trigger the route handler manually for testing logic
const getContentHandler = bbsController.stack.find(layer => layer.route && layer.route.path === '/getContent').route.stack[0].handle;

getContentHandler(req, res, () => {});
