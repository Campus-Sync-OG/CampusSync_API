const { Sequelize } = require("sequelize");
const sequelize = require('../config/sequelize');
const { on } = require("pdfkit");

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('subject', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        subject_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,

        },
    }, {
        sequelize,
        tableName: 'subject',
        timestamps: false,
    },
    );
};

