const fs = require('fs');
const path = require('path');
const assert = require('assert');

const mailControllerPath = path.join(__dirname, '../routes/mailController.js');
const mailControllerContent = fs.readFileSync(mailControllerPath, 'utf8');

try {
    // Assert that the hardcoded credentials and configuration are not present
    assert.strictEqual(mailControllerContent.includes('mail.nis.co.kr'), false, "Found hardcoded host: mail.nis.co.kr");
    assert.strictEqual(mailControllerContent.includes('465'), false, "Found hardcoded port: 465");
    assert.strictEqual(mailControllerContent.includes('admin@nis.co.kr'), false, "Found hardcoded user/from email: admin@nis.co.kr");
    assert.strictEqual(mailControllerContent.includes('k5s#fscyqB'), false, "Found hardcoded password: k5s#fscyqB");

    // Check that process.env variables are used instead
    assert.strictEqual(mailControllerContent.includes('process.env.MAIL_HOST'), true, "Missing process.env.MAIL_HOST");
    assert.strictEqual(mailControllerContent.includes('process.env.MAIL_PORT'), true, "Missing process.env.MAIL_PORT");
    assert.strictEqual(mailControllerContent.includes('process.env.MAIL_USER'), true, "Missing process.env.MAIL_USER");
    assert.strictEqual(mailControllerContent.includes('process.env.MAIL_PASS'), true, "Missing process.env.MAIL_PASS");

    console.log("Success: Hardcoded SMTP credentials have been removed from routes/mailController.js");
} catch (error) {
    console.error("Test failed:", error.message);
    process.exit(1);
}
