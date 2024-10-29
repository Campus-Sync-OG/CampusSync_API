const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

const User = require('./users');
const StudentProfile = require('./student');
const ParentProfile = require('./parent');
const StaffProfile = require('./staff');
const Attendance = require('./attendance');

// User and StudentProfile Association
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'student' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'users' });

// User and ParentProfile Association
User.hasOne(ParentProfile, { foreignKey: 'user_id', as: 'parent' });
ParentProfile.belongsTo(User, { foreignKey: 'user_id', as: 'users' });

// User and StaffProfile Association
User.hasOne(StaffProfile, { foreignKey: 'user_id', as: 'staff' });
StaffProfile.belongsTo(User, { foreignKey: 'user_id', as: 'staff' });

// Attendance Association (Student -> Attendance)
User.hasMany(Attendance, { foreignKey: 'student_id', as: 'attendance' });
Attendance.belongsTo(User, { foreignKey: 'student_id', as: 'student' });