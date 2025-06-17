const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize"); // Sequelize instance

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "student_promotion",
    {
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'student', // Reference table name
          key: 'admission_no',
        },
      },
      from_class: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      from_section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      to_class: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      to_section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      promoted_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      tableName: "student_promotion",
      timestamps: false,
    }
  );
};
