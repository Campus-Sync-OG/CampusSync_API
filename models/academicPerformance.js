const Sequelize = require('sequelize');
const AcademicPerformance = sequelize.define('performance', {
    student_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    marks_obtained: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    term: {
      type: DataTypes.ENUM('term1', 'term2', 'final'),
      allowNull: false,
    },
    exam_date: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = AcademicPerformance;
  