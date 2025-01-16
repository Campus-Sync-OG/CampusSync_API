const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance

const User = sequelize.define('User', {
  unique_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true, // Make unique_id the primary key
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'principal'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'user', 
  timestamps: false, // Since you’re defining created_at and updated_at manually
});

module.exports = User;
