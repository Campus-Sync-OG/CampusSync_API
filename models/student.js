const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance
const User = require('./user');
const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
  },
  admission_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true, // Ensure each admission number is unique
  },
  student_name: {
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
  alter_no: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isNumeric: true, // Ensure alternate number contains only numbers
    },
  },
  student_photo: {
    type: DataTypes.BLOB,
    allowNull: true, // Optional field for photo URL
    validate: {
      isUrl: true, // Ensure it's a valid URL
    },
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true, // Optional field for Date of Birth
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['Male', 'Female', 'Other']], // Ensure gender is valid
    },
  },
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'student',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Student;
