;
const sequelize = require("../config/sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "leaveapplication",
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
          model: "student", // Make sure this matches your students table
          key: "admission_no",
        },
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Pending",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "leaveapplication",
      timestamps: false,
    }
  );
};
