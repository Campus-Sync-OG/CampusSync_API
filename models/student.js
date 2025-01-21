const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');

const Student = sequelize.define('Student', {
  admission_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    references: {
       model :User,
       key:'unique_id',
    }
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
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      isNumeric: true,
    },
  },
  alter_no: {
    type: DataTypes.BIGINT,
    allowNull: true,
    validate: {
      isNumeric: true,
    },
  },
  dob: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['Male', 'Female', 'Other']],
    },
  },
  status: {
    type: DataTypes.ENUM('active','inactive'),
    allowNull: false,
    defaultValue: 'active', // Default value for status
  },
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'student',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Student;
