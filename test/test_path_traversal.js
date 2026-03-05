const request = require('http');
const express = require('express');
const moveRouter = require('../routes/move');
const app = express();

app.set('views', __dirname + '/../views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use('/move', moveRouter);

// Error handler
app.use(function(err, req, res, next) {
  res.status(500).send(err.message);
});

const server = app.listen(0, () => {
    const port = server.address().port;

    // Attempt path traversal
    request.get(`http://localhost:${port}/move/..%2F..%2F..%2Fetc/passwd`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Status code (Traversal 1):', res.statusCode);
            console.log('Response (Traversal 1):', data);

            if(res.statusCode !== 400) {
              console.error("Path traversal prevention failed!");
              process.exit(1);
            }

            // Attempt valid path
            request.get(`http://localhost:${port}/move/about/about1.html`, (res2) => {
                let data2 = '';
                res2.on('data', chunk => data2 += chunk);
                res2.on('end', () => {
                    console.log('Status code (Valid):', res2.statusCode);
                    // console.log('Response (Valid):', data2.substring(0, 50));

                    if(res2.statusCode !== 200) {
                      console.error("Valid path failed!");
                      process.exit(1);
                    }
                    server.close();
                });
            });
        });
    });
});
