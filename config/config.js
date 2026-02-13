require('./env').load();

const config = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  operatorsAliases: false
};

module.exports = {
  development: config,
  test: config,
  production: config
};
