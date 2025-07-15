'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('academics', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student',
          key: 'admission_no',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subjects: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'subject',
          key: 'subject_name',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      class_grade: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      exam_format: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'examformat',
          key: 'exam_name',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      academic_year: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      marks_obtained: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_marks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      exam_date: {
        type: Sequelize.DATE,
        allowNull: true,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('academics');
  }
};
