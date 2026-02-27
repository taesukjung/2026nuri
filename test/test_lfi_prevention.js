const http = require('http');
const express = require('express');
const moveRouter = require('../routes/move');
const enMoveRouter = require('../routes/enMove');

const app = express();

// Mock render to capture path
app.use((req, res, next) => {
    res.render = (view, options) => {
        if (view.includes('..')) {
            res.status(500).end(`VULNERABLE: ${view}`);
        } else {
            res.status(200).end(`RENDERED: ${view}`);
        }
    };
    next();
});

app.use('/move', moveRouter);
app.use('/en/move', enMoveRouter);

// Add error handler because our router throws Error('Page not found')
app.use((err, req, res, next) => {
    if (err.message === 'Page not found') {
        res.status(404).end('Page not found');
    } else {
        res.status(500).end(err.message);
    }
});

const server = http.createServer(app);

function testRequest(path, description) {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${server.address().port}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data, description });
            });
        }).on('error', reject);
    });
}

server.listen(0, async () => {
    console.log('Running LFI Prevention Test...');

    try {
        const tests = [
            // Malicious attempts
            { path: '/move/..%2f/passwd', expectStatus: [404], failIfBodyContains: 'VULNERABLE' },
            { path: '/move/archive/..%2f..%2fapp', expectStatus: [404], failIfBodyContains: 'VULNERABLE' },
            { path: '/en/move/..%2f/passwd', expectStatus: [404], failIfBodyContains: 'VULNERABLE' },

            // Valid attempts
            { path: '/move/company/introduction', expectStatus: [200], expectBody: 'RENDERED: company/introduction' },
            { path: '/en/move/company/introduction', expectStatus: [200], expectBody: 'RENDERED: en/company/introduction' }
        ];

        let failed = false;

        for (const test of tests) {
            const result = await testRequest(test.path, test.path);

            console.log(`Test: ${test.path}`);
            console.log(`  Status: ${result.status}`);
            console.log(`  Body: ${result.body}`);

            if (result.body.includes('VULNERABLE')) {
                console.error('  ❌ FAIL: Path Traversal Vulnerability Detected!');
                failed = true;
            } else if (test.expectStatus.includes(result.status)) {
                 if (test.expectBody && !result.body.includes(test.expectBody)) {
                     console.error(`  ❌ FAIL: Expected body to contain '${test.expectBody}'`);
                     failed = true;
                 } else {
                     console.log('  ✅ PASS');
                 }
            } else {
                console.error(`  ❌ FAIL: Expected status ${test.expectStatus.join(' or ')}, got ${result.status}`);
                failed = true;
            }
            console.log('---');
        }

        if (failed) {
            console.log('Overall Result: FAILED');
            process.exit(1);
        } else {
            console.log('Overall Result: PASSED');
            process.exit(0);
        }

    } catch (err) {
        console.error(err);
        process.exit(1);
    } finally {
        server.close();
    }
});
