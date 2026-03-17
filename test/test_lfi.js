const express = require('express');
const app = express();
const request = require('http').request;
const moveRouter = require('../routes/move');
const enMoveRouter = require('../routes/enMove');
const path = require('path');

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use('/move', moveRouter);
app.use('/en/move', enMoveRouter);

// Error handling middleware to simulate app.js logic
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
});

let testCases = [
    { path: '/move/..%2f..%2f..%2fetc/passwd', desc: 'LFI on moveRouter' },
    { path: '/en/move/..%2f..%2f..%2fetc/passwd', desc: 'LFI on enMoveRouter' },
    { path: '/move/about/about1.html', desc: 'Legitimate request on moveRouter' }
];

let currentIndex = 0;
let successCount = 0;
let server;

function runNextTest() {
    if (currentIndex >= testCases.length) {
        server.close();
        if (successCount === testCases.length) {
            console.log('All tests passed.');
            process.exit(0);
        } else {
            console.error(`Failed ${testCases.length - successCount} out of ${testCases.length} tests.`);
            process.exit(1);
        }
        return;
    }

    const testCase = testCases[currentIndex];
    const req = request({
        hostname: '127.0.0.1',
        port: server.address().port,
        path: testCase.path,
        method: 'GET'
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`[${testCase.desc}] -> Status: ${res.statusCode}`);

            let passed = false;
            if (testCase.path.includes('..')) {
                // Expecting 400 Bad Request
                passed = res.statusCode === 400;
            } else {
                // Expecting successful render (200 OK)
                passed = res.statusCode === 200;
            }

            if (passed) {
                console.log(`  PASS`);
                successCount++;
            } else {
                console.error(`  FAIL`);
            }

            currentIndex++;
            runNextTest();
        });
    });
    req.end();
}

server = app.listen(0, () => {
    runNextTest();
});
