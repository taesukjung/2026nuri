const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test to verify that routes/mailController.js does not contain hardcoded secrets
function testNoHardcodedMailSecrets() {
    const mailControllerPath = path.join(__dirname, '..', 'routes', 'mailController.js');
    const content = fs.readFileSync(mailControllerPath, 'utf8');

    // These regexes check if a string literal is being assigned to `user` or `pass` or `from` in the transporter config
    // Instead of checking specific string literals, we check for presence of process.env usage

    // Test that process.env.SMTP_USER and process.env.SMTP_PASS are used
    assert.ok(content.includes('process.env.SMTP_USER'), 'mailController.js should use process.env.SMTP_USER');
    assert.ok(content.includes('process.env.SMTP_PASS'), 'mailController.js should use process.env.SMTP_PASS');

    // Test that known hardcoded values are NOT present
    assert.ok(!content.includes('admin@nis.co.kr'), 'Hardcoded email "admin@nis.co.kr" found in mailController.js');
    assert.ok(!content.includes('k5s#fscyqB'), 'Hardcoded password found in mailController.js');

    console.log('✅ testNoHardcodedMailSecrets passed: No hardcoded secrets found in mailController.js');
}

testNoHardcodedMailSecrets();
