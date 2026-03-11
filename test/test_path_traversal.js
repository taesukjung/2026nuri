const assert = require('assert');
const http = require('http');
const app = require('../app');

const server = http.createServer(app);

function listenOnFreePort(server) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      resolve(server.address().port);
    });
    server.on('error', reject);
  });
}

async function runTest() {
  try {
    const port = await listenOnFreePort(server);
    console.log(`Test server running on port ${port}`);

    const options = {
      hostname: 'localhost',
      port: port,
      path: '/move/..%2f/etc%2fpasswd',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);

      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        // We expect it to be blocked or return an error, NOT expose /etc/passwd
        assert.ok(res.statusCode !== 200 || !data.includes('root:x:0:0:'), 'Path traversal detected!');
        console.log('Test passed: Path traversal is mitigated or not exposing sensitive files.');
        server.close();
        process.exit(0);
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      server.close();
      process.exit(1);
    });

    req.end();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

runTest();
