const assert = require('assert');
const path = require('path');

// Mock Sequelize and DataTypes
const DataTypes = {
    STRING: (length) => ({ type: 'STRING', length })
};

let definedTable = null;
let definedAttributes = null;

const sequelize = {
    define: (tableName, attributes) => {
        definedTable = tableName;
        definedAttributes = attributes;
        return { tableName, attributes };
    }
};

// Import the model
const modelPath = path.join(__dirname, '../../models/tbl_auth.js');
console.log(`Testing model at: ${modelPath}`);
const modelDefiner = require(modelPath);

// Execute the model definition
const model = modelDefiner(sequelize, DataTypes);

// Assertions
try {
    console.log('Verifying table name...');
    assert.strictEqual(definedTable, 'tbl_auth', 'Table name should be tbl_auth');

    console.log('Verifying attributes...');
    assert.ok(definedAttributes.w_id, 'w_id attribute should exist');
    assert.strictEqual(definedAttributes.w_id.type.type, 'STRING', 'w_id type should be STRING');
    assert.strictEqual(definedAttributes.w_id.type.length, 10, 'w_id length should be 10');
    assert.strictEqual(definedAttributes.w_id.primaryKey, true, 'w_id should be primary key');

    assert.ok(definedAttributes.w_passwd, 'w_passwd attribute should exist');
    assert.strictEqual(definedAttributes.w_passwd.type.type, 'STRING', 'w_passwd type should be STRING');
    assert.strictEqual(definedAttributes.w_passwd.type.length, 10, 'w_passwd length should be 10');
    assert.strictEqual(definedAttributes.w_passwd.allowNull, true, 'w_passwd should allow null');

    console.log('All tests passed for tbl_auth model.');
} catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
}
