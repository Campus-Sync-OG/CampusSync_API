const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;
const Sequelize = require('sequelize');
const User = require('./user');
const Teacher = require('./teacher');
const Student = require('./student');
const Principal = require('./principal');
const Academics = require('./academics');

User.belongsTo(Student, {foreignKey: 'unique_id',targetKey: 'admission_no',as: 'student',constraints: false,});
Student.hasOne(User, {foreignKey: 'unique_id',sourceKey: 'admission_no',as: 'user',constraints: false,});


User.belongsTo(Teacher, { foreignKey: 'unique_id',targetKey: 'emp_id',as: 'teacher',constraints: false,});
Teacher.hasOne(User, {foreignKey: 'unique_id',sourceKey: 'emp_id',as: 'user',constraints: false,});


User.belongsTo(Principal, {foreignKey: 'unique_id',targetKey: 'emp_id',as: 'principal',constraints: false,});
Principal.hasOne(User, {foreignKey: 'unique_id',sourceKey: 'emp_id',as: 'user',constraints: false,});

Academics.belongsTo(Student, { foreignKey: 'admission_no',targetKey: 'admission_no',constraints:true,});
Student.hasMany(Academics, { foreignKey: 'admission_no' ,sourceKey: 'admission_no',constraints:true,});

Academics.belongsTo(Teacher, { foreignKey: 'emp_id', targetKey: 'emp_id',constraints:true,});
Teacher.hasMany(Academics, { foreignKey: 'emp_id',sourceKey: 'emp_id',constraints:true,});


module.exports = {
    User,
    Teacher,
    Student,
    Principal,
    Academics,
  };