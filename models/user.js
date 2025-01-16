const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true, // Corrected from 'autoincrement' to 'autoIncrement'
    primaryKey: true, // Define this as the primary key
  },
  unique_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure each unique_id is unique across roles
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
    defaultValue: Sequelize.NOW, // Ensure default value is correct
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: 'user', // Explicitly specify table name to avoid case mismatch
  timestamps: false, // Since you’re defining created_at and updated_at manually
});

module.exports = User;
