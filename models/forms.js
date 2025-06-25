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
        allowNull: false,
        // Fix defaultValue for DATEONLY
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status:{
        type: DataTypes.STRING,
        allowNull: false,
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
