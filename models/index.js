const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

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

Academics.belongsTo(Student, { foreignKey: 'student_id',targetKey: 'id',constraints:true,onDelete:'CASCADE',onUpdate:'CASCADE,'});
Student.hasMany(Academics, { foreignKey: 'student_id' ,sourceKey: 'id',constraints:true,onDelete:'CASCADE',onUpdate:'CASCADE,'});

Academics.belongsTo(Teacher, { foreignKey: 'teacher_id', targetKey: 'id',constraints:true,onDelete:'SET NULL',onUpdate:'CASCADE,'});
Teacher.hasMany(Academics, { foreignKey: 'teacher_id',sourceKey: 'id',constraints:true,onDelete:'SET NULL',onUpdate:'CASCADE,'});





module.exports = {
    User,
    Teacher,
    Student,
    Principal,
    Academics,
  };