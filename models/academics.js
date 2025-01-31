const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize"); // Sequelize instance

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "academics",
    {
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'student', // Table name
          key: 'admission_no',
        },
      },
      emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'teacher', // Table name
          key: 'emp_id',
        },
      },
      teacher_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      class_grade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      term_semester: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      academic_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marks_obtained: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_marks: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exam_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    }, {
    tableName: 'academics',
    timestamps: false,
  }
  );
};




