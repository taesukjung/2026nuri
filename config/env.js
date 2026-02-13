const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env');

module.exports = {
  load: () => {
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length < 2) return;

        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();

        if (key && !process.env[key]) {
          process.env[key] = value;
        }
      });
    }
  }
};
