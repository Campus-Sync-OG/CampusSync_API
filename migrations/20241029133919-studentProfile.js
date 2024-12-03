'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true, // Set user_id as the primary key
        references: {
          model: 'users', // Reference the users table
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
          model: 'users',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
  },
};
