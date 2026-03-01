const fs = require('fs');
const path = require('path');

const envPath = process.env.DOTENV_PATH
    ? path.resolve(process.env.DOTENV_PATH)
    : path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
    // console.log(`Loading environment from ${envPath}`);
    const envConfig = fs.readFileSync(envPath, 'utf8');

    envConfig.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const parts = line.split('=');
        if (parts.length < 2) return;

        const key = parts[0].trim();
        let value = parts.slice(1).join('=').trim(); // Handle values containing '='

        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        if (key && !process.env[key]) { // Don't overwrite existing env vars
            process.env[key] = value;
        }
    });
}

module.exports = {};
