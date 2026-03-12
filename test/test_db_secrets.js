const fs = require('fs');
const path = require('path');

function testDbSecretsRemoved() {
    const configPath = path.join(__dirname, '..', 'config', 'config.json');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Parse the JSON file
    let config;
    try {
        config = JSON.parse(configContent);
    } catch (e) {
        console.error('Test failed: config/config.json is not valid JSON.');
        process.exit(1);
    }

    let foundHardcoded = false;
    for (const env of ['development', 'test', 'production']) {
        if (config[env]) {
            // Check if it's using the default placeholder passwords or empty strings
            // INSTEAD of specific known production passwords
            const isDefault = (config[env].password === '' || config[env].password === null || config[env].password === 'your_db_password');
            if (!isDefault) {
                console.error(`\x1b[31mFAIL: config.json contains a potential hardcoded password in ${env} environment.\x1b[0m`);
                foundHardcoded = true;
            }
        }
    }

    if (foundHardcoded) {
        console.error('Test failed: Hardcoded database credentials found in config/config.json.');
        process.exit(1);
    } else {
        console.log('\x1b[32mPASS: No hardcoded database credentials found in config/config.json.\x1b[0m');
    }
}

testDbSecretsRemoved();
