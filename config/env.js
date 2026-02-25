const fs = require('fs');
const path = require('path');

// Allow overriding the path via environment variable (useful for tests)
// This must be set BEFORE requiring this module
const envPath = process.env.DOTENV_PATH
  ? path.resolve(process.env.DOTENV_PATH)
  : path.resolve(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8').split('\n');
  envConfig.forEach((line) => {
    // Ignore comments and empty lines
    if (line && line.indexOf('=') !== -1 && !line.trim().startsWith('#')) {
      const [key, ...rest] = line.split('=');
      let val = rest.join('=').trim();

      // Strip surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      process.env[key.trim()] = val;
    }
  });
}
