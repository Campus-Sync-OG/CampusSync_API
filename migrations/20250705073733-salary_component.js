'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('salary_component', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: Sequelize.ENUM("teacher", "principal", "admin", "operator"),
        allowNull: false,
        unique: true, // Ensure only one component set per role
      },
      component_values: {
        type: Sequelize.JSONB, // or Sequelize.JSON if not using PostgreSQL
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('salary_component');
  }
};
