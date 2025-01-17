const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

const User = require('./user');
const Teacher = require('./teacher');
const Student = require('./student');
const Principal = require('./principal');


User.belongsTo(models.Student, {foreignKey: 'unique_id',targetKey: 'admission_no',as: 'student',constraints: false,});
Student.hasOne(models.User, {foreignKey: 'unique_id',sourceKey: 'admission_no',as: 'user',constraints: false,});


User.belongsTo(models.Teacher, { foreignKey: 'unique_id',targetKey: 'emp_id',as: 'teacher',constraints: false,});
Teacher.hasOne(models.User, {foreignKey: 'unique_id',sourceKey: 'emp_id',as: 'user',constraints: false,});


User.belongsTo(models.Principal, {foreignKey: 'unique_id',targetKey: 'p_id',as: 'principal',constraints: false,});
Principal.hasOne(models.User, {foreignKey: 'unique_id',sourceKey: 'p_id',as: 'user',constraints: false,});





module.exports = {
    User,
    Teacher,
    Student,
    Principal,
  };