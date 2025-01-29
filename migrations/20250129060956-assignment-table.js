'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignment', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      teacherName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      attachment: {
        type: Sequelize.STRING, // Stores file path of the uploaded PDF
        allowNull: true,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student', // Reference the Student table
          key: 'admission_no', // Foreign key column in the Student table
        },
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'teacher', // Reference the Teacher table
          key: 'emp_id', // Foreign key column in the Teacher table
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assignment');
  },
};