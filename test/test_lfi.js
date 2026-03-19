const app = require('../app');
const http = require('http');

const server = http.createServer(app);

server.listen(0, () => {
  const port = server.address().port;
  console.log(`Server listening on port ${port}`);

  http.get(`http://localhost:${port}/move/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2fetc/passwd`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      if (res.statusCode !== 400) {
         console.error('Test Failed: LFI vulnerability still present.');
         server.close();
         process.exit(1);
      }
      console.log('Test Passed: LFI vulnerability fixed.');
      server.close();
      process.exit(0);
    });
  });
});
