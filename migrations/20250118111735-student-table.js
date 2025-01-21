'use strict';

const sequelize = require("../config/sequelize");

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
        allowNull: false,
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
        validate: {
          isIn: [['Male', 'Female']],
        },
      },
      class: {
        type: sequelize.STRING,
        allowNull: true,
      },
      section: {
        type: sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student');
  },
};
