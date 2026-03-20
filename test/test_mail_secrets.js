const fs = require('fs');
const path = require('path');

const mailControllerPath = path.join(__dirname, '../routes/mailController.js');
const mailControllerContent = fs.readFileSync(mailControllerPath, 'utf8');

// The secret to look for (base64 encoded to avoid putting the plaintext secret in the test file)
const secretBase64 = 'azVzI2ZzY3lxQg==';
const secretPlain = Buffer.from(secretBase64, 'base64').toString('utf8');

if (mailControllerContent.includes(secretPlain)) {
  console.error("ERROR: Hardcoded SMTP password found in routes/mailController.js");
  process.exit(1);
}

// Ensure process.env.SMTP_PASS is used instead
if (!mailControllerContent.includes('process.env.SMTP_PASS')) {
  console.error("ERROR: process.env.SMTP_PASS not found in routes/mailController.js");
  process.exit(1);
}

console.log("Success: Hardcoded SMTP password removed and process.env.SMTP_PASS is used.");
