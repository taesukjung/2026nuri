const assert = require('assert');
const express = require('express');
const moveRouter = require('../routes/move');
const enMoveRouter = require('../routes/enMove');
const path = require('path');

async function runTests() {
    let successCount = 0;
    let failCount = 0;

    async function testEndpoint(routerPath, testPath, expectedStatuses) {
        const app = express();
        app.set('views', path.join(__dirname, '../views'));
        app.set('view engine', 'ejs');
        app.engine('html', require('ejs').renderFile);

        app.use(routerPath, routerPath === '/move' ? moveRouter : enMoveRouter);

        app.use((err, req, res, next) => {
            res.status(500).send(err.message);
        });

        return new Promise((resolve) => {
            const server = app.listen(0, async () => {
                const port = server.address().port;
                try {
                    const url = `http://localhost:${port}${routerPath}${testPath}`;
                    const res = await fetch(url);

                    if (expectedStatuses.includes(res.status)) {
                        console.log(`✅ [${routerPath}] ${testPath} -> Expected one of ${expectedStatuses.join('|')}, got ${res.status}`);
                        successCount++;
                    } else {
                        console.error(`❌ [${routerPath}] ${testPath} -> Expected one of ${expectedStatuses.join('|')}, got ${res.status}`);
                        failCount++;
                    }
                } catch(err) {
                    console.error(`❌ [${routerPath}] ${testPath} -> Error:`, err.message);
                    failCount++;
                } finally {
                    server.close();
                    resolve();
                }
            });
        });
    }

    console.log("Running path traversal tests...");

    // Normal paths should be 200 or 500 (depending on view existence), but NOT 400
    await testEndpoint('/move', '/contact/contact1.html', [200, 500]);
    await testEndpoint('/en/move', '/contact/contact1.html', [200, 500]);

    // Invalid paths should return 400 Bad Request
    await testEndpoint('/move', '/contact/..%2f..%2fetc%2fpasswd', [400]);
    await testEndpoint('/move', '/..%2f/passwd', [400]);
    await testEndpoint('/move', '/..%2e/passwd', [400]);

    await testEndpoint('/en/move', '/contact/..%2f..%2fetc%2fpasswd', [400]);
    await testEndpoint('/en/move', '/..%2f/passwd', [400]);

    // test '.env' - valid characters but fails regex because we don't allow dot in dir name
    // actually, `contact` is dir, `.env` is file.
    // `fileRegex` is /^[a-zA-Z0-9_.-]+$/ -> `.env` is valid! So it should pass the regex.
    // Since `.env` doesn't exist as a view, it returns 500
    await testEndpoint('/move', '/contact/.env', [200, 500]);

    console.log(`\nTests completed: ${successCount} passed, ${failCount} failed.`);
    if (failCount > 0) {
        process.exit(1);
    }
}

runTests();
