// models/teacher.js
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('teacher_class_sections', {
    emp_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    teacher_role:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'classTeacher'
    },
  });

  return Teacher;
};
