const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');

const Teacher = sequelize.define('Teacher', {
  unique_id: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true, // Use unique_id as the primary key
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
      isEmail: true,
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
      isNumeric: true,
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
  role: {
    type: DataTypes.ENUM('classteacher', 'subjectteacher'),
    allowNull: false,
    defaultValue: 'classteacher',
  },
}, {
  sequelize,
  modelName: 'Teacher',
  tableName: 'teacher',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Teacher;
