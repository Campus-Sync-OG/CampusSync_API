'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('principal', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Ensure each emp_id is unique
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true, // Validate the email format
        },
      },
      school_name: {
        type: Sequelize.STRING,
        allowNull: false, // Assuming the principal must be associated with a school
      },
      add_teacher: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Field to check if the principal can add teachers
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW, // Default to current date if not provided
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('principal');
  },
};
