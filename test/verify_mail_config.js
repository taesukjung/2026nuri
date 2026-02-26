const assert = require('assert');
const path = require('path');

// Set up mock environment variables BEFORE requiring the controller
process.env.MAIL_HOST = 'smtp.test.com';
process.env.MAIL_PORT = '587';
process.env.MAIL_SECURE = 'true';
process.env.MAIL_USER = 'test@test.com';
process.env.MAIL_PASS = 'secret123';

// Mock nodemailer
const nodemailerMock = {
    createTransport: (options) => {
        try {
            assert.strictEqual(options.host, 'smtp.test.com');
            assert.strictEqual(options.port, '587');
            assert.strictEqual(options.secure, true);
            assert.strictEqual(options.auth.user, 'test@test.com');
            assert.strictEqual(options.auth.pass, 'secret123');
            console.log('Mail config verification passed!');
        } catch (e) {
            console.error('Mail config verification failed:', e);
            process.exit(1);
        }
        return {
            sendMail: (mailOptions, callback) => {
                callback(null, { response: 'ok' });
            }
        };
    }
};

// Intercept require('nodemailer')
const nodemailerPath = require.resolve('nodemailer');
require.cache[nodemailerPath] = {
    id: nodemailerPath,
    filename: nodemailerPath,
    loaded: true,
    exports: nodemailerMock
};

// Load the controller
try {
    require('../routes/mailController');
} catch (e) {
    console.error('Failed to load controller:', e);
    process.exit(1);
}
