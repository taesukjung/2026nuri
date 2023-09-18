console.log("--------> models/tbl_ref.js")
module.exports = (sequelize, DataTypes) => {

    var ref = sequelize.define('tbl_ref', {
        b_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        b_category: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        b_date: {
            type: DataTypes.STRING(4),
            allowNull: true,
        },
        b_sector: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        b_client: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        b_text: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: true,
    });

    return ref;


};