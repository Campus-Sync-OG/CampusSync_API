const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "notification",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.JSON,
        allowNull: false,
      },
       class_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    section_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "user", // Table name
          key: "unique_id",
        },
      },
    },
    {
      tableName: "notification",
      timestamps: true,
    }
  );
};
