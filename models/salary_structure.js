const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  const salary_structure = sequelize.define('salary_structure', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    base_salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // Optional: You can later link to a `school` table
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    tableName: 'salary_structure',
    underscored: true,
    timestamps: false // You’re using manual timestamps
  });

  return salary_structure;
};
