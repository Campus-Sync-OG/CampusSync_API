'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teacher', {
      unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'user', // Reference to the 'user' table
          key: 'unique_id',
        },
      },
      emp_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      emp_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_no: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      joining_date: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },
      role: {
        type: Sequelize.ENUM('classteacher', 'subjectteacher'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('active','inactive'),
        allowNull: false,
        defaultValue: 'active', // Default value for status
      },
      
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teacher');
  },
};
