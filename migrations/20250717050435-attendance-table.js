'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('attendance', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student',
          key: 'admission_no',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      class: {
        type: Sequelize.STRING,
        allowNull: false
      },
      section: {
        type: Sequelize.STRING,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      period: {
        type: Sequelize.STRING,
        allowNull: false
      },
      attendance_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'day-wise'
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'present'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('attendance');
  }
};
