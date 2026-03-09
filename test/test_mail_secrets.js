const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test to ensure hardcoded SMTP credentials are removed
function testNoHardcodedSecrets() {
    console.log("Running security test: Check for hardcoded SMTP secrets");

    const mailControllerPath = path.join(__dirname, '..', 'routes', 'mailController.js');

    // Check if the file exists
    if (!fs.existsSync(mailControllerPath)) {
        console.error(`Error: File not found at ${mailControllerPath}`);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(mailControllerPath, 'utf8');

    // Define the secrets that should not be in the file
    const secretsToCheck = [
        'k5s#fscyqB',
        'admin@nis.co.kr'
    ];

    let foundSecrets = false;

    for (const secret of secretsToCheck) {
        if (fileContent.includes(secret)) {
            console.error(`🚨 SECURITY VULNERABILITY FOUND: Hardcoded secret "${secret}" found in routes/mailController.js`);
            foundSecrets = true;
        }
    }

    try {
        assert.strictEqual(foundSecrets, false, "Hardcoded secrets were found in the codebase!");
        console.log("✅ Security test passed: No hardcoded SMTP credentials found in routes/mailController.js");
    } catch (err) {
        console.error("❌ Security test failed");
        console.error(err.message);
        process.exit(1);
    }
}

testNoHardcodedSecrets();
