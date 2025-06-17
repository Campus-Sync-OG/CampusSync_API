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
const _forms = require('./forms');
const _subject = require('./subject');
const _parent = require('./parent');
const _schoolinfo = require('./schoolinfo');
const _notification = require('./notification');
const _announcement = require('./announcement');
const _achievement = require('./achievement');
const _feedback = require('./feedback');
const _certificates = require('./certificates');
const _leaveapplication = require('./leaveapplication');
const _class_section = require('./class_section');
const _timetable = require('./timetable');
const _teacher_subject = require('./teacher_subject');
const _circular = require('./circular');
const _student_assignment = require('./student_assignment'); // Assuming this is needed
const _studymodules = require('./studymodules'); // Assuming this is needed
const _teacher_leave_application = require('./teacher_leave_application');
const _teacher_class_sections = require('./teacher_class_sections'); // Assuming this is needed

// Initialize models
const user = _user(sequelize, DataTypes);
const teacher = _teacher(sequelize, DataTypes);
const student = _student(sequelize, DataTypes);
const principal = _principal(sequelize, DataTypes);
const academics = _academics(sequelize, DataTypes);
const assignment = _assignment(sequelize, DataTypes);
const examformat = _examformat(sequelize, DataTypes);
const attendance = _attendance(sequelize, DataTypes);
const fee = _fee(sequelize, DataTypes);
const forms = _forms(sequelize, DataTypes);
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
const teacher_subject = _teacher_subject(sequelize, DataTypes);
const circular = _circular(sequelize, DataTypes);
const student_assignment = _student_assignment(sequelize, DataTypes);
const studymodules = _studymodules(sequelize, DataTypes); // Assuming this is needed
const teacher_leave_application = _teacher_leave_application(sequelize, DataTypes);
const teacher_class_sections = _teacher_class_sections(sequelize, DataTypes); // Assuming this is needed

// Define associations between models

// User to role mapping
user.hasOne(teacher, { foreignKey: 'emp_id', targetKey: 'unique_id', as: 'teacher' });
teacher.belongsTo(user, { foreignKey: 'emp_id', targetKey: 'unique_id', as: 'user' });

user.hasOne(student, { foreignKey: 'admission_no', targetKey: 'unique_id', as: 'student' });
student.belongsTo(user, { foreignKey: 'admission_no', targetKey: 'unique_id', as: 'user' });

user.hasOne(principal, { foreignKey: 'p_id', targetKey: 'unique_id', as: 'principal' });
principal.belongsTo(user, { foreignKey: 'p_id', targetKey: 'unique_id', as: 'user' });

// Academics belongs to student (student performance)
academics.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'student' });
student.hasMany(academics, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'academics' });

// Assignment relationships
assignment.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'student' });
assignment.belongsTo(teacher, { foreignKey: 'emp_id', targetKey: 'emp_id', as: 'teacher' });

student.hasMany(assignment, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'assignment' });
teacher.hasMany(assignment, { foreignKey: 'admission_no', targetKey: 'admission_no', as: 'assignment' }); // possibly incorrect: teacher foreignKey should be 'emp_id'

// Exam format and academic connection
examformat.hasOne(academics, { foreignKey: 'exam_format', targetKey: 'exam_name', as: 'academicDetails' });
academics.belongsTo(examformat, { foreignKey: 'exam_format', targetKey: 'exam_name', as: 'examFormatDetails' });

// Student achievement
student.hasMany(achievement, { foreignKey: 'admission_no', targetKey: 'admission_no' });
achievement.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no' });

// Attendance tracking
student.hasMany(attendance, { foreignKey: "admission_no", targetKey: "admission_no", as: "attendances" });
attendance.belongsTo(student, { foreignKey: 'admission_no', targetKey: 'admission_no' });



// Fee tracking
student.hasMany(fee, { foreignKey: "admission_no", targetKey: "admission_no" });
fee.belongsTo(student, { foreignKey: "admission_no", targetKey: "admission_no" });

// Subject mapping with principal (unclear)
// subject.hasOne(principal, { foreignKey: 'id', targetKey: 'id', as: 'subjects' });

// Parent-child relation
student.hasOne(parent, { foreignKey: "admission_no", targetKey: "admission_no", as: "parentInfo" });
parent.belongsTo(student, { foreignKey: "admission_no", targetKey: "admission_no", as: "student" });

// Notification for users
user.hasMany(notification, { foreignKey: "user_id", targetKey: "unique_id" });
notification.belongsTo(user, { foreignKey: "user_id", targetKey: "unique_id" });

// Announcements by user
announcement.belongsTo(user, { foreignKey: 'user_id', targetKey: 'unique_id', as: 'creator' });
user.hasMany(announcement, { foreignKey: 'user_id', targetKey: 'unique_id', as: 'announcements' });

// Subject assignment to teachers
teacher.hasMany(teacher_subject, { foreignKey: 'emp_id', targetKey: 'emp_id' });
teacher_subject.belongsTo(teacher, { foreignKey: 'emp_id', targetKey: 'emp_id' });

user.hasMany(teacher_leave_application, {
  foreignKey: 'emp_id',
  sourceKey: 'unique_id',
  as: 'leaveApplications',
});

// leave application belongs to a user (teacher)
teacher_leave_application.belongsTo(user, {
  foreignKey: 'emp_id',
  targetKey: 'unique_id',
  as: 'teacher',
});

teacher.hasMany(teacher_class_sections, {
  foreignKey: 'emp_id',targetKey: 'emp_id'

});

teacher_class_sections.belongsTo(teacher, {
  foreignKey: 'emp_id', targetKey: 'emp_id'
 
});

// Export all models
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
  timetable,
  teacher_subject,
  circular,
  student_assignment,
  studymodules,
  teacher_leave_application,
  teacher_class_sections,
};
