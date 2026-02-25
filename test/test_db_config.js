const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Define test credentials with quotes to verify parser stripping
const testEnv = {
  DB_USERNAME: 'test_user',
  DB_PASSWORD: '"test_password_with_quotes"', // Quoted
  DB_DATABASE: "'test_db_with_single_quotes'", // Single quoted
  DB_HOST: 'test_host',
  DB_PORT: '3306'
};

// Create temporary .env file for testing
const tempEnvPath = path.resolve(__dirname, 'temp.env');
process.env.DOTENV_PATH = tempEnvPath;

const envContent = Object.entries(testEnv)
  .map(([key, val]) => `${key}=${val}`)
  .join('\n');

fs.writeFileSync(tempEnvPath, envContent);

console.log('Created temporary .env file at:', tempEnvPath);

// Clear require cache for config/env if it was already loaded
delete require.cache[require.resolve('../config/env')];

// Load env vars
require('../config/env');

console.log('Loaded environment variables');

// Require models to trigger config loading
try {
  // Clear models cache just in case
  const modelsPath = require.resolve('../models/index');
  if (require.cache[modelsPath]) delete require.cache[modelsPath];

  const db = require('../models/index');
  const config = db.sequelize.config;

  console.log('Loaded config:', {
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port
  });

  // Verify
  assert.strictEqual(config.username, 'test_user', 'Username mismatch');
  assert.strictEqual(config.password, 'test_password_with_quotes', 'Password mismatch (quotes not stripped)');
  assert.strictEqual(config.database, 'test_db_with_single_quotes', 'Database mismatch (single quotes not stripped)');
  assert.strictEqual(config.host, 'test_host', 'Host mismatch');
  assert.strictEqual(String(config.port), '3306', 'Port mismatch');

  console.log('✅ Configuration loaded correctly from temp.env with quote stripping');
} catch (error) {
  console.error('❌ Verification failed:', error);
  // Cleanup even on error
  if (fs.existsSync(tempEnvPath)) {
    fs.unlinkSync(tempEnvPath);
  }
  process.exit(1);
}

// Cleanup
if (fs.existsSync(tempEnvPath)) {
  fs.unlinkSync(tempEnvPath);
  console.log('Removed temporary .env file');
}
