const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

const User = require('./users');
const Student = require('./student');
const Attendance = require('./attendance');
const Academic=require('./academics');

User.hasMany(Student,{foreignKey:'user_class_teacher_id',as:'student'});
Student.belongsTo(User,{foreignKey:'user_class_teacher_id',as:'classTeacher'});


Student.hasMany(Attendance, {foreignKey: 'student_id',as: 'attendanceRecords',});
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student',});

Student.hasMany(Academic, {
  foreignKey: 'student_id',
  sourceKey: 'id',
});
Academic.belongsTo(Student, {
  foreignKey: 'student_id',
  targetKey: 'id', // Matches the primary key of `students`
  onDelete: 'CASCADE',
});



module.exports = {
    User,
    Student,
    Attendance,
    Academic,
  };