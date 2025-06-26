'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_promotion', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from_class: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      from_section: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      to_class: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      to_section: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      promoted_on: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_promotion');
  },
};
