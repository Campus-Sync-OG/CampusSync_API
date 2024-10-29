const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./users');

module.exports = (sequelize, DataTypes) => {
  const StaffProfile = sequelize.define(
    'StaffProfile',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      staff_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      designation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      hire_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      contact_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
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
      },
    },
    {
      tableName: 'staff_profiles',
      timestamps: false,
      underscored: true,
    }
  );
}

module.exports = StaffProfile;