const assert = require('assert');
const express = require('express');
const moveRouter = require('../routes/move');
const enMoveRouter = require('../routes/enMove');

const app = express();

// Override res.render to prevent actual rendering errors during testing
app.use((req, res, next) => {
    res.render = function(view, options, callback) {
        res.status(200).send(`Rendered ${view}`);
    };
    next();
});

app.use('/move', moveRouter);
app.use('/en/move', enMoveRouter);

let server;

async function runTests() {
    try {
        await new Promise((resolve) => {
            server = app.listen(0, resolve);
        });

        const port = server.address().port;
        const baseUrl = `http://localhost:${port}`;

        // Test valid paths
        let res = await fetch(`${baseUrl}/move/about/about1.html`);
        assert.notEqual(res.status, 400, "Valid path should not return 400");

        res = await fetch(`${baseUrl}/en/move/about/about1.html`);
        assert.notEqual(res.status, 400, "Valid English path should not return 400");

        // Test malicious paths (LFI)
        res = await fetch(`${baseUrl}/move/..%2f/app.js`);
        assert.strictEqual(res.status, 400, "Malicious path traversal should return 400");
        let text = await res.text();
        assert.strictEqual(text, 'Invalid directory or file path.', "Should return correct error message");

        res = await fetch(`${baseUrl}/en/move/..%2f/app.js`);
        assert.strictEqual(res.status, 400, "Malicious path traversal should return 400");

        res = await fetch(`${baseUrl}/move/some_dir/..%2f..%2fpackage.json`);
        assert.strictEqual(res.status, 400, "Malicious path traversal should return 400");

        console.log("✅ test_path_traversal.js: Path traversal tests passed!");
    } catch (e) {
        console.error("❌ test_path_traversal.js: Failed", e);
        process.exitCode = 1;
    } finally {
        if (server) {
            server.close();
        }
    }
}

runTests();
