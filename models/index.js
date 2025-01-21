const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const User = require('./user');
const Teacher = require('./teacher');
const Student = require('./student');
const Principal = require('./principal');
const Academics = require('./academics');

// Define associations
User.belongsTo(Student, {
  foreignKey: 'unique_id',
  targetKey: 'admission_no',
  as: 'student',
  constraints: false, // Set this to `true` if you want to enforce database-level constraints
});

Student.hasOne(User, {
  foreignKey: 'unique_id',
  sourceKey: 'admission_no',
  as: 'user',
  constraints: false,
});

User.belongsTo(Teacher, {
  foreignKey: 'unique_id',
  targetKey: 'emp_id',
  as: 'teacher',
  constraints: false,
});

Teacher.hasOne(User, {
  foreignKey: 'unique_id',
  sourceKey: 'emp_id',
  as: 'user',
  constraints: false,
});

User.belongsTo(Principal, {
  foreignKey: 'unique_id',
  targetKey: 'p_id',
  as: 'principal',
  constraints: false,
});

Principal.hasOne(User, {
  foreignKey: 'unique_id',
  sourceKey: 'p_id',
  as: 'user',
  constraints: false,
});

module.exports = {
    User,
    Teacher,
    Student,
    Principal,
  };