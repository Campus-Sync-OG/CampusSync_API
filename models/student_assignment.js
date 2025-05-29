const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('student_assignment', {
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'student',
        key: 'admission_no',
      },
    },
    emp_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'teacher',
        key: 'emp_id',
      },
    },
    emp_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject_name: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'subject',
        key: 'subject_name',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    attachment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'student_assignment',
    timestamps: false,
  });
};
