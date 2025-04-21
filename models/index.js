const sequelize = require('../config/sequelize');
const DataTypes = require('sequelize').DataTypes;

// Import models
const _user = require('./user');
const _teacher = require('./teacher');
const _student = require('./student');
const _principal = require('./principal');
const _academics = require('./academics');
const _assignment = require('./assignment');
const _examformat = require('./examformat');
const _attendance = require('./attendance');
const _fee = require('./fee');
const _forms=require('./forms');
const _subject=require('./subject');
const _parent=require('./parent');
const _schoolinfo=require('./schoolinfo');
const _notification=require('./notification');
const _announcement = require('./announcement');
const _achievement = require('./achievement');
const _feedback = require('./feedback');
const _certificates = require('./certificates');
const _leaveapplication = require('./leaveapplication');
const _class_section = require('./class_section');
const _timetable = require('./timetable');

const user = _user(sequelize, DataTypes);
const teacher = _teacher(sequelize, DataTypes);
const student = _student(sequelize, DataTypes);
const principal = _principal(sequelize, DataTypes);
const academics = _academics(sequelize, DataTypes);
const assignment = _assignment(sequelize, DataTypes);
const examformat = _examformat(sequelize, DataTypes);
const attendance = _attendance(sequelize, DataTypes);
const fee = _fee(sequelize, DataTypes);
const forms = _forms(sequelize, DataTypes)
const subject = _subject(sequelize, DataTypes);
const parent = _parent(sequelize, DataTypes);
const schoolinfo = _schoolinfo(sequelize, DataTypes);
const notification = _notification(sequelize, DataTypes);
const announcement = _announcement(sequelize, DataTypes);
const achievement = _achievement(sequelize, DataTypes);
const feedback = _feedback(sequelize, DataTypes);
const certificates = _certificates(sequelize, DataTypes);
const leaveapplication = _leaveapplication(sequelize, DataTypes);
const class_section = _class_section(sequelize, DataTypes);
const timetable = _timetable(sequelize, DataTypes);
// Define associations
user.hasOne(teacher, { foreignKey: 'emp_id', sourceKey: 'unique_id', as: 'teacher' });
teacher.belongsTo(user, { foreignKey: 'emp_id', targetKey: 'unique_id', as: 'user' });

user.hasOne(student, { foreignKey: 'admission_no', sourceKey: 'unique_id', as: 'student' });
student.belongsTo(user, { foreignKey: 'admission_no', targetKey: 'unique_id', as: 'user' });

user.hasOne(principal, { foreignKey: 'p_id', targetKey: 'unique_id', as: 'principal' });
principal.belongsTo(user, { foreignKey: 'p_id', targetKey: 'unique_id', as: 'user' });

//teacher.hasMany(student, { foreignKey: 'emp_id', as: 'students' });
//student.belongsTo(teacher, { foreignKey: 'emp_id', as: 'teacher' });

// Academics belongs to Student
academics.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'student', });
//academics.belongsTo(teacher, {foreignKey: 'emp_id',targetKey: 'emp_id',as: 'teacher',});

// Student has many Academics
student.hasMany(academics, { foreignKey: 'admission_no', sourceKey: 'admission_no', as: 'academics' });
//teacher.hasMany(academics, { foreignKey: 'emp_id',sourceKey: 'emp_id',as: 'academics',});


assignment.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'student', });
assignment.belongsTo(teacher, { foreignKey: 'emp_id', targetKey: 'emp_id', as: 'teacher', });

student.hasMany(assignment, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'assignment' });
teacher.hasMany(assignment, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'assignment' });

examformat.hasOne(principal, { foreignKey: 'id', targetkey: 'id', as: 'examformat' });
principal.belongsTo(examformat, { foreignKey: 'id', targetKey: 'id', as: 'examformat' });

examformat.hasOne(academics, { foreignKey: 'exam_format', targetKey: 'exam_name', as: 'academicDetails' });
academics.belongsTo(examformat, { foreignKey: 'exam_format', targetKey: 'exam_name', as: 'examFormatDetails' });


student.hasMany(attendance, { foreignKey: "admission_no", sourceKey: "admission_no", as: "attendances", });
teacher.hasMany(attendance, { foreignKey: "emp_id", sourceKey: "emp_id", as: "attendances", });


student.hasMany(fee, { foreignKey: "admission_no", sourceKey: "admission_no"});
fee.belongsTo(student, { foreignKey: "admission_no", targetKey: "admission_no" });

forms.hasOne(teacher, { foreignKey: 'id', targetkey: 'id', as: 'forms' });


subject.hasOne(principal, { foreignKey: 'id', targetKey: 'id', as: 'subjects' });

student.hasOne(parent, { foreignKey: "admission_no", sourceKey: "admission_no", as: "parentInfo" });
parent.belongsTo(student, { foreignKey: "admission_no", targetKey: "admission_no", as: "student" });
user.hasMany(notification, { foreignKey: "user_id", sourceKey: "unique_id" });
notification.belongsTo(user, { foreignKey: "user_id", targetKey: "unique_id" });
announcement.belongsTo(user, { foreignKey: 'user_id', targetKey: 'unique_id', as: 'creator' });
user.hasMany(announcement, { foreignKey: 'user_id', sourceKey: 'unique_id', as: 'announcements' });
user.hasMany(feedback, { foreignKey: "unique_id", as: "received_feedbacks" });
feedback.belongsTo(user, { foreignKey: "unique_id", as: "teacher" });
module.exports = {
  sequelize,
  user,
  teacher,
  student,
  principal,
  academics,
  assignment,
  examformat,
  attendance,
  fee,
  forms,
  subject,
  parent,
  schoolinfo,
  notification,
  announcement,
  achievement,
  feedback,
  certificates,
  leaveapplication,
  class_section,
  timetable
};