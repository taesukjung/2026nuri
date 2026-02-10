module.exports = (sequelize, DataTypes) => {

    var bbs = sequelize.define('tbl_bbs', {
        b_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        b_category: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        b_time: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        b_date: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        b_time: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        b_writer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        b_subject: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        b_text: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        b_count: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue:0
        },

    }, {
        timestamps: true,
    });

    return bbs;


};