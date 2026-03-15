const fs = require('fs');
const path = require('path');
const assert = require('assert');

function runTest() {
    try {
        const filePath = path.join(__dirname, '../routes/mailController.js');
        const content = fs.readFileSync(filePath, 'utf8');

        // Assert that the hardcoded password string is no longer present
        assert.ok(!content.includes("pass: 'k5s#fscyqB'"), "Hardcoded SMTP password found in mailController.js");
        // Also assert that the password is not hardcoded anywhere else
        assert.ok(!content.includes("k5s#fscyqB"), "Hardcoded SMTP password string found in mailController.js");

        // Verify environment variable usage
        assert.ok(content.includes('process.env.SMTP_PASS'), "SMTP_PASS environment variable not used in mailController.js");
        assert.ok(content.includes('process.env.SMTP_USER'), "SMTP_USER environment variable not used in mailController.js");
        assert.ok(content.includes('process.env.SMTP_HOST'), "SMTP_HOST environment variable not used in mailController.js");
        assert.ok(content.includes('process.env.SMTP_PORT'), "SMTP_PORT environment variable not used in mailController.js");

        console.log('✅ Security: Hardcoded Secrets - test passed');
    } catch (error) {
        console.error('❌ Security: Hardcoded Secrets - test failed');
        console.error(error);
        process.exit(1);
    }
}

runTest();
