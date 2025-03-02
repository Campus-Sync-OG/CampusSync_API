const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Form = sequelize.define(
    "forms",
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize.fn("NOW"), // Fix defaultValue for DATEONLY
      },
      link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "forms",
      timestamps: true, // Keeps createdAt & updatedAt fields
    }
  );

  return Form;
};
