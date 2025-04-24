'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await query_Interface.createTable('timetables', {
      timetable_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      classSectionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'class_sections',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      day: {
        type: Sequelize.STRING,
        allowNull: false
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('timetables');
  }
};
