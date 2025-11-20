const { Sequelize } = require("sequelize");
const sequelize = require('../config/sequelize');
const { end } = require("pdfkit");
module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define(
    "announcement",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Fix defaultValue for DATEONLY
      },
      end_date: {
        type: DataTypes.DATEONLY, // Use DATEONLY for date without time
        allowNull: false, // Ensure end_date is always after start_date
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active', // Default value for status
      }
    },
    {
      tableName: "announcement",
      timestamps: true, // Keeps createdAt & updatedAt fields
    }
  );

  return Announcement;
};
