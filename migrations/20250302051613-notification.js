'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
       class_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'user', // References the 'user' table
          key: 'unique_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP '),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notification');
  },
};
