'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_assignment', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student',
          key: 'admission_no',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'teacher',
          key: 'emp_id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      emp_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject_name: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'subject',
          key: 'subject_name',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      attachment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      section: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_assignment');
  }
};
