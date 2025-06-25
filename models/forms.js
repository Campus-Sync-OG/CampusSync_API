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
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        // Fix defaultValue for DATEONLY
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      status:{
        type: DataTypes.STRING,
        allowNull: true,
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
