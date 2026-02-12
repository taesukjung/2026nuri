const assert = require('assert');
const Module = require('module');

// 1. Set environment variables
process.env.MAIL_USER = 'test_user';
process.env.MAIL_PASS = 'test_pass';
process.env.MAIL_FROM = 'test_from';

// 2. Mock nodemailer
const originalRequire = Module.prototype.require;
let createTransportCalled = false;
let capturedOptions = null;

Module.prototype.require = function(id) {
    if (id === 'nodemailer') {
        return {
            createTransport: (options) => {
                createTransportCalled = true;
                capturedOptions = options;
                return { sendMail: () => {} }; // Dummy transporter
            }
        };
    }
    return originalRequire.apply(this, arguments);
};

// 3. Load the module
try {
    require('../routes/mailController');
} catch (e) {
    console.error("Error loading mailController:", e);
    process.exit(1);
}

// 4. Verify
console.log("Verifying mail configuration...");

if (!createTransportCalled) {
    console.error("❌ nodemailer.createTransport was not called.");
    process.exit(1);
}

try {
    assert.strictEqual(capturedOptions.auth.user, 'test_user', 'Auth user does not match environment variable');
    assert.strictEqual(capturedOptions.auth.pass, 'test_pass', 'Auth pass does not match environment variable');

    console.log("✅ Mail configuration verified successfully.");
} catch (e) {
    console.error("❌ Verification failed:", e.message);
    process.exit(1);
}

// Restore require (good practice)
Module.prototype.require = originalRequire;
