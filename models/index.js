const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

const User = require('./users');
const Student = require('./student');
const Attendance = require('./attendance');

User.hasMany(Student,{foreignKey:'user_class_teacher_id',as:'student'});
Student.belongsTo(User,{foreignKey:'user_class_teacher_id',as:'classTeacher'});


Student.hasMany(Attendance, {foreignKey: 'student_id',as: 'attendanceRecords',});
Attendance.belongsTo(Student, { foreignKey: 'student_id', as: 'student',});

module.exports = {
    User,
    Student,
    Attendance,
  };