const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        "class_section",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            className: {
                type: DataTypes.STRING,
                allowNull: false,

            },
            section_name: {
                type: DataTypes.STRING,
                allowNull: false,

            },
        },
        {
            tableName: "class_section",
            timestamps: false,
        }
    );
};
