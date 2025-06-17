'use strict';

const teacher = require("../models/teacher");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teacher_class_sections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      section_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      teacher_role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'classTeacher'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teacher_class_sections');
  }
};
