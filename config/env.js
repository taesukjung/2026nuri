const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return;

    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            const val = value.join('=').trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            if (!process.env[key.trim()]) {
                process.env[key.trim()] = val;
            }
        }
    });
}

module.exports = loadEnv;
