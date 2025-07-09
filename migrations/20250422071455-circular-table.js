'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('circular', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      headline: {
        type: Sequelize.STRING,
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachment_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: true // Set to false if class_name is mandatory
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true // Set to false if section is mandatory
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'student',
          key: 'admission_no'
        },
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'teacher',
          key: 'emp_id'
        },
      },
      // If you want timestamps later, add createdAt, updatedAt here
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('circular');
  }
};
