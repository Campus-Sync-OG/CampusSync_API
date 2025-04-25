'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher_subject', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emp_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      section: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subjects: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacher_subject');
  }
};
