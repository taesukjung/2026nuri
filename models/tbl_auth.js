console.log("--------> models/tbl_auth.js")
module.exports = (sequelize, DataTypes) => {

    var auth = sequelize.define('tbl_auth', {
        w_id: {
            type: DataTypes.STRING(10),
            primaryKey: true
        },
        w_passwd: {
            type: DataTypes.STRING(10),
            allowNull: true
        },

    });

    return auth;


};