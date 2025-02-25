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
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
        references:{
          model:'subject',
          key:'subject_name',
        },
      },
      class_grade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exam_format: {
        type: DataTypes.STRING,
        allowNull: false,
        references:{
          model:'examformat',
          key:'exam_name',
        },

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




