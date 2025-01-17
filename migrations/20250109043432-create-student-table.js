'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student', {
      unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      alter_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      student_photo: {
        type: Sequelize.STRING,
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student');
  },
};
