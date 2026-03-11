const fs = require('fs');
const path = require('path');
const assert = require('assert');

const mailControllerPath = path.resolve(__dirname, '../routes/mailController.js');

try {
  const fileContent = fs.readFileSync(mailControllerPath, 'utf8');

  // Check if there are no more hardcoded secrets in the mail controller
  assert.strictEqual(fileContent.includes('admin@nis.co.kr'), false, 'Hardcoded email found');
  assert.strictEqual(fileContent.includes('k5s#fscyqB'), false, 'Hardcoded password found');

  // Check if it's using process.env
  assert.strictEqual(fileContent.includes('process.env.SMTP_USER'), true, 'process.env.SMTP_USER not found');
  assert.strictEqual(fileContent.includes('process.env.SMTP_PASS'), true, 'process.env.SMTP_PASS not found');

  console.log('Test passed: No hardcoded secrets found in mailController.js');
} catch (error) {
  console.error('Test failed:', error.message);
  process.exit(1);
}
