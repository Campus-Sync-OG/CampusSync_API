'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('performance', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // refers to the users table
          key: 'user_id',
        },
      },
      subject: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      marks_obtained: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_marks: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      grade: {
        type: Sequelize.STRING(2),
        allowNull: true,
      },
      term: {
        type: Sequelize.ENUM('term1', 'term2', 'final'),
        allowNull: false,
      },
      exam_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('performance');
  }
};
