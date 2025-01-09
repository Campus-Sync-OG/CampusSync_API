const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance
const User = require('./user');
const Principal = sequelize.define('Principal', {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true, // Validate the email format
    },
  },
  school_name: {
    type: DataTypes.STRING,
    allowNull: false, // Assuming the principal must be associated with a school
  },
  add_teacher: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // Field to check if the principal can add teachers
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW, // Default to current date if not provided
  },
}, {
  sequelize,
  modelName: 'Principal',
  tableName: 'principal',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Principal;
