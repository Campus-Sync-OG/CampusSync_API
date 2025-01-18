const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');

const Student = sequelize.define('Student', {
  admission_no: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    references: {
       models: User,
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
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isNumeric: true,
    },
  },
  alter_no: {
    type: DataTypes.INTEGER,
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
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'student',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Student;
