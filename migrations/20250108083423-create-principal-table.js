'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('principal', {
      p_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'user', // Reference to the 'user' table
          key: 'unique_id',
        },
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
        validate: {
          isNumeric: true,
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      school_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      add_teacher: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Permission to add teacher
      },
      add_student: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Permission to add student
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('principal');
  },
};
