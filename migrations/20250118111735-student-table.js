'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student', {
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'user', // Reference to the 'user' table
          key: 'unique_id',
        },
      },
      student_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      alter_no: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      class: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      section: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student');
  },
};
