const assert = require('assert');

// Set environment variables before requiring the module
process.env.MAIL_HOST = 'test.host.com';
process.env.MAIL_PORT = '123';
process.env.MAIL_USER = 'testuser@test.com';
process.env.MAIL_PASS = 'testpass123';

let capturedConfig = null;

// Mock nodemailer by intercepting require
const nodemailerPath = require.resolve('nodemailer');
require.cache[nodemailerPath] = {
    id: nodemailerPath,
    filename: nodemailerPath,
    loaded: true,
    exports: {
        createTransport: (config) => {
            capturedConfig = config;
            return {
                sendMail: () => {}
            };
        }
    }
};

// Now require the controller, which will use the mock and our env vars
require('../routes/mailController');

try {
    assert.strictEqual(capturedConfig.host, 'test.host.com');
    assert.strictEqual(capturedConfig.port, '123');
    assert.strictEqual(capturedConfig.auth.user, 'testuser@test.com');
    assert.strictEqual(capturedConfig.auth.pass, 'testpass123');
    console.log('✅ Mail configuration correctly uses environment variables.');
    process.exit(0);
} catch (err) {
    console.error('❌ Mail configuration test failed:', err.message);
    process.exit(1);
}
