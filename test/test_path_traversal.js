const assert = require('assert');
const request = require('http');
const app = require('../app');

const testPathTraversal = () => {
    const server = app.listen(0, () => {
        const port = server.address().port;

        const req = request.get(`http://localhost:${port}/move/..%2f..%2fconfig/config.json`, (res) => {
            assert.strictEqual(res.statusCode, 403, 'Should be forbidden');

            const req2 = request.get(`http://localhost:${port}/move/contact/..%2f..%2f..%2fetc%2fpasswd`, (res2) => {
                assert.strictEqual(res2.statusCode, 400, 'Should be bad request');
                console.log('Path traversal tests passed.');
                server.close();
                process.exit(0);
            });
            req2.on('error', (err) => {
                console.error(err);
                server.close();
                process.exit(1);
            });
        });

        req.on('error', (err) => {
            console.error(err);
            server.close();
            process.exit(1);
        });
    });
};

testPathTraversal();
