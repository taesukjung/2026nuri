const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;

    // Split by first equals sign
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      // Join the rest back together in case value contains =
      let value = parts.slice(1).join('=').trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Only set if not already set (to allow system env vars to override)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

module.exports = {};
