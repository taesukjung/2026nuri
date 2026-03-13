const http = require('http');
const app = require('../app');

const server = http.createServer(app);

server.listen(0, () => {
    const port = server.address().port;
    console.log(`Test server running on port ${port}`);

    const options1 = {
        hostname: '127.0.0.1',
        port: port,
        path: '/move/..%2f/config.json',
        method: 'GET'
    };

    const req1 = http.request(options1, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            if (res.statusCode === 400 && data === 'Invalid directory or file name.') {
                console.log('Test passed: Path traversal blocked on /move (400)');
            } else {
                console.error(`Test failed on /move: Expected 400, got ${res.statusCode}`);
                console.error(`Response data: ${data}`);
                server.close();
                process.exit(1);
            }

            // Test 2
            const options2 = {
                hostname: '127.0.0.1',
                port: port,
                path: '/en/move/..%2f/config.json',
                method: 'GET'
            };

            const req2 = http.request(options2, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    if (res.statusCode === 400 && data === 'Invalid directory or file name.') {
                        console.log('Test passed: Path traversal blocked on /en/move (400)');
                    } else {
                        console.error(`Test failed on /en/move: Expected 400, got ${res.statusCode}`);
                        console.error(`Response data: ${data}`);
                        server.close();
                        process.exit(1);
                    }

                    // Test 3 (Valid request)
                    const options3 = {
                        hostname: '127.0.0.1',
                        port: port,
                        path: '/move/dir1/file1.html',
                        method: 'GET'
                    };

                    const req3 = http.request(options3, (res) => {
                         // We don't care about 404 or success, just that it doesn't return 400
                         if (res.statusCode !== 400) {
                             console.log(`Test passed: Valid path not blocked (${res.statusCode})`);
                         } else {
                             console.error(`Test failed on valid path: Expected != 400, got ${res.statusCode}`);
                             server.close();
                             process.exit(1);
                         }

                         server.close();
                         console.log("All tests passed!");
                    });
                    req3.end();
                });
            });

            req2.end();
        });
    });

    req1.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        server.close();
        process.exit(1);
    });

    req1.end();
});
