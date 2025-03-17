const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize"); // Sequelize instance

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "Schoolinfo",
    {
      school_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      established_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1800,
          max: new Date().getFullYear(),
        },
      },
      affiliation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "schoolinfo",
      timestamps: false,
    }
  );
};
