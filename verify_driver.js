const Sequelize = require('sequelize');
const config = require('./config/config.json').development;

try {
  // Try to initialize Sequelize. This should load the driver (mysql2) if available.
  const sequelize = new Sequelize(config.database, config.username, config.password, config);
  console.log('Sequelize initialized. Driver loaded.');
} catch (e) {
  console.error('Initialization failed:', e);
  process.exit(1);
}
