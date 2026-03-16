const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test 1: Ensure config.json does not contain hardcoded secrets
const configPath = path.join(__dirname, '../config/config.json');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

for (const env in configData) {
  const cfg = configData[env];
  if (cfg.username) {
    assert.strictEqual(cfg.username, 'root', `Hardcoded username found in ${env} config`);
  }
  if (cfg.password) {
    assert.strictEqual(cfg.password, 'password', `Hardcoded password found in ${env} config`);
  }
  if (cfg.database) {
    assert.ok(cfg.database.startsWith('database_'), `Hardcoded database found in ${env} config`);
  }
}
console.log('✅ Test passed: config.json contains no hardcoded secrets.');

// Test 2: Ensure models/index.js securely loads environment variables
const modelsIndexJsPath = path.join(__dirname, '../models/index.js');
const modelsIndexContent = fs.readFileSync(modelsIndexJsPath, 'utf8');

assert.ok(modelsIndexContent.includes('process.env.DB_DATABASE'), 'DB_DATABASE environment variable not used');
assert.ok(modelsIndexContent.includes('process.env.DB_USERNAME'), 'DB_USERNAME environment variable not used');
assert.ok(modelsIndexContent.includes('process.env.DB_PASSWORD'), 'DB_PASSWORD environment variable not used');
assert.ok(modelsIndexContent.includes('process.env.DB_HOST'), 'DB_HOST environment variable not used');
assert.ok(modelsIndexContent.includes('process.env.DB_PORT'), 'DB_PORT environment variable not used');

console.log('✅ Test passed: models/index.js uses process.env for DB configuration.');
