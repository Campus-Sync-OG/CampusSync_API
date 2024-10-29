'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // refers to the users table
          key: 'id',
        },
      },
      student_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      class: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      section: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      parent_user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users', // refers to the users table
          key: 'id',
        },
        allowNull: true,
      },
      admission_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      transportation_route: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      gps_tracking_id: {
        type: Sequelize.STRING(100),
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
    await queryInterface.dropTable('student');
  }
};
