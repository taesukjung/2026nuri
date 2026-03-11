const assert = require('assert');
const moveRouter = require('../routes/move');

console.log("Verifying fix for routes/move.js...");

// Find the route handler for '/:dir/:file'
const layer = moveRouter.stack.find(l => l.route && l.route.path === '/:dir/:file');
if (!layer) {
    console.error("Could not find route /:dir/:file in routes/move.js");
    process.exit(1);
}
const handler = layer.route.stack[0].handle;

const runTest = (name, params, expectedAction) => {
    console.log(`\nTest: ${name}`);
    const req = {
        params: params,
        query: { emailTo: 'test' }
    };

    let actionTriggered = false;

    const res = {
        render: (viewPath, options) => {
            console.log(`  render called with: ${viewPath}`);
            if (expectedAction === 'render') {
                actionTriggered = true;
                if (viewPath.includes('..') || !viewPath.startsWith(params.dir + '/')) {
                     console.error("  FAIL: Render called with unsafe path!");
                } else {
                     console.log("  PASS: Render called safely.");
                }
            } else {
                console.error("  FAIL: Unexpected render call.");
            }
        }
    };

    const next = (err) => {
        console.log(`  next called${err ? ' with error' : ''}`);
        if (expectedAction === 'next') {
            actionTriggered = true;
            console.log("  PASS: next called as expected.");
        } else {
            console.error("  FAIL: Unexpected next call.");
        }
    };

    handler(req, res, next);

    if (!actionTriggered) {
        console.error("  FAIL: No action triggered (neither render nor next).");
    }
};

// 1. Valid Case
runTest('Valid Path', { dir: 'contact', file: 'contact1.html' }, 'render');

// 2. Invalid Dir (Path Traversal)
runTest('Invalid Dir (..)', { dir: '..', file: 'app.js' }, 'next');

// 3. Invalid File (Path Traversal)
runTest('Invalid File (../)', { dir: 'contact', file: '../app.js' }, 'next');

// 4. Invalid Dir (Not in whitelist)
runTest('Invalid Dir (fake)', { dir: 'fake_dir', file: 'contact1.html' }, 'next');

// 5. Invalid File (Syntax)
runTest('Invalid File (syntax)', { dir: 'contact', file: 'file*with*stars.html' }, 'next');
