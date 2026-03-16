'use strict';
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    const database = process.env.DB_DATABASE || config.database;
    const username = process.env.DB_USERNAME || config.username;
    const password = process.env.DB_PASSWORD || config.password;

    const dbConfig = { ...config };
    if (process.env.DB_HOST) dbConfig.host = process.env.DB_HOST;
    if (process.env.DB_PORT) dbConfig.port = process.env.DB_PORT;

    sequelize = new Sequelize(database, username, password, dbConfig);
}

// model.js 자동 스캔
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.BBs = require('./bbs')(sequelize, Sequelize);

module.exports = db;
