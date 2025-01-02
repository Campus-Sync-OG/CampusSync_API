'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('academics', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4, // Requires the `uuid-ossp` extension in PostgreSQL
      },
      student_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      marks_obtain: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_marks: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      grade: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      term: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      exam_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('academics');
  }
};
