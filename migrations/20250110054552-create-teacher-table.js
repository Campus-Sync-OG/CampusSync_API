'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher', {
      unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      emp_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      role: {
        type: Sequelize.ENUM('classteacher', 'subjectteacher'),
        allowNull: false,
      },
      
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacher');
  },
};
