const fs = require('fs');
const path = require('path');
const assert = require('assert');

function testDbSecrets() {
    console.log('Running test_db_secrets.js...');
    const configPath = path.join(__dirname, '..', 'config', 'config.json');
    let configStr;
    try {
        configStr = fs.readFileSync(configPath, 'utf8');
    } catch (err) {
        console.error('Failed to read config/config.json:', err);
        process.exit(1);
    }

    let config;
    try {
        config = JSON.parse(configStr);
    } catch (err) {
        console.error('Failed to parse config/config.json:', err);
        process.exit(1);
    }

    const environments = ['development', 'test', 'production'];

    for (const env of environments) {
        if (!config[env]) continue;

        const dbConfig = config[env];

        // Assert that the old hardcoded credentials are removed
        assert.notStrictEqual(dbConfig.password, 'nisww#@1', `Environment ${env} contains hardcoded password.`);
        assert.notStrictEqual(dbConfig.username, 'niswww', `Environment ${env} contains hardcoded username.`);
        assert.notStrictEqual(dbConfig.database, 'niswww', `Environment ${env} contains hardcoded database name.`);
        assert.notStrictEqual(dbConfig.host, '121.126.171.29', `Environment ${env} contains hardcoded IP address.`);
    }

    console.log('test_db_secrets.js passed: No hardcoded secrets found.');
}

if (require.main === module) {
    testDbSecrets();
}

module.exports = testDbSecrets;
