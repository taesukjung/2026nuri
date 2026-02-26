const fs = require('fs');
const path = require('path');
const assert = require('assert');

const tempEnvPath = path.resolve(__dirname, '../.env.test');
const envContent = `
TEST_KEY=test_value
TEST_QUOTED="quoted value"
TEST_SINGLE_QUOTED='single quoted value'
# This is a comment
TEST_WITH_EQUAL=key=value
`;

try {
    fs.writeFileSync(tempEnvPath, envContent);
    process.env.DOTENV_PATH = tempEnvPath;

    // Clear require cache for config/env.js to ensure it runs again if loaded previously
    delete require.cache[require.resolve('../config/env')];
    require('../config/env');

    assert.strictEqual(process.env.TEST_KEY, 'test_value');
    assert.strictEqual(process.env.TEST_QUOTED, 'quoted value');
    assert.strictEqual(process.env.TEST_SINGLE_QUOTED, 'single quoted value');
    assert.strictEqual(process.env.TEST_WITH_EQUAL, 'key=value');

    console.log('Environment loader test passed!');
} catch (e) {
    console.error('Environment loader test failed:', e);
    process.exit(1);
} finally {
    if (fs.existsSync(tempEnvPath)) {
        fs.unlinkSync(tempEnvPath);
    }
}
