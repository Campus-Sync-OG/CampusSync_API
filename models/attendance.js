const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "attendance",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student", // Table name
          key: "admission_no",
        },
      
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "active",
      },
      emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "teacher", // Table name
          key: "emp_id",
        },
        
      },
    },
    {
      tableName: "attendance",
      timestamps: false,
    }
  );
};
