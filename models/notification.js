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
      notification_type: {
        type: DataTypes.ENUM('General Announcement', 'Fee Update','Event Announcement','Academic Results','Leave Update'),
        allowNull: false,
        defaultValue: 'General Announcement'
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
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
