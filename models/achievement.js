const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "achievement",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student", // Reference the Student model
          key: "admission_no",
        },
      },
      className: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Imageurl: {
      //   type: DataTypes.TEXT, // Store multiple image URLs as a string
      //   allowNull: true,
      // },
      Certificateurl: {
        type: DataTypes.TEXT, // Store multiple certificate URLs as a string
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY, // Only store the date
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "achievement",
      timestamps: false, // Disable createdAt/updatedAt timestamps
    }
  );
};
