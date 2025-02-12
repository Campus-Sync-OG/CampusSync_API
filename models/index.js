const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

// Import models
const _user = require('./user');
const _teacher = require('./teacher');
const _student = require('./student');
const _principal = require('./principal');
const _academics = require('./academics');
const _assignment = require('./assignment');
const _examformat=require('./examformat');

const user = _user(sequelize, DataTypes);
const teacher = _teacher(sequelize, DataTypes);
const student = _student(sequelize, DataTypes);
const principal = _principal(sequelize, DataTypes);
const academics = _academics(sequelize, DataTypes);
const assignment = _assignment(sequelize, DataTypes);
const examformat =_examformat(sequelize,DataTypes);

// Define associations
user.hasOne(teacher, { foreignKey: 'emp_id', sourceKey: 'unique_id', as: 'teacher' });
teacher.belongsTo(user, { foreignKey: 'emp_id', targetKey: 'unique_id', as: 'user' });

user.hasOne(student, { foreignKey: 'admission_no', sourceKey: 'unique_id', as: 'student' });
student.belongsTo(user, { foreignKey: 'admission_no', targetKey: 'unique_id', as: 'user' });

user.hasOne(principal, { foreignKey: 'p_id', sourceKey: 'unique_id', as: 'principal' });
principal.belongsTo(user, { foreignKey: 'p_id', targetKey: 'unique_id', as: 'user' });

teacher.hasMany(student, { foreignKey: 'emp_id', as: 'students' });
student.belongsTo(teacher, { foreignKey: 'emp_id', as: 'teacher' });

// Academics belongs to Student
academics.belongsTo(student, {foreignKey: 'admission_no',targetKey: 'admission_no',as: 'student',});
//academics.belongsTo(teacher, {foreignKey: 'emp_id',targetKey: 'emp_id',as: 'teacher',});

// Student has many Academics
student.hasMany(academics, {foreignKey: 'admission_no',sourceKey: 'admission_no',as: 'academics'});
//teacher.hasMany(academics, { foreignKey: 'emp_id',sourceKey: 'emp_id',as: 'academics',});


assignment.belongsTo(student, {foreignKey: 'admission_no',  targetKey: 'admission_no',  as: 'student',});
assignment.belongsTo(teacher, { foreignKey: 'emp_id',   targetKey: 'emp_id', as: 'teacher', });

student.hasMany(assignment, { foreignKey: 'admission_no',  targetKey: 'admission_no', as: 'assignment' });
teacher.hasMany(assignment, { foreignKey: 'admission_no',  targetKey: 'admission_no', as: 'assignment' });

examformat.hasOne(principal, { foreignKey: 'id',  targetkey:'id', as:'examformat' });
principal.belongsTo(examformat, { foreignKey: 'id',  targetKey:'id', as:'examformat'});

module.exports = {
  sequelize,
  user,
  teacher,
  student,
  principal,
  academics,
  assignment,
  examformat,
};