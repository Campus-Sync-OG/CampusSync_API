'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('circular', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      headline: {
        type: Sequelize.STRING,
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachment_url: {
        type: Sequelize.STRING,
        allowNull: true
      }
      // If you want timestamps later, add createdAt, updatedAt here
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('circular');
  }
};
