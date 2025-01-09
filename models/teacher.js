const {Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance
const User = require('./user');
const Teacher = sequelize.define('Teacher', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  emp_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensure each emp_id is unique
  },
  emp_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true, // Validate the email format
    },
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_no: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true, // Ensure phone number contains only numbers
    },
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'Teacher',
  tableName: 'teacher',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Teacher;
