'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("attendance", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: "student", // Table name
          key: "admission_no",
        },
        onDelete: "CASCADE",
      },
      emp_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: "teacher", // Table name
          key: "emp_id",
        },
        onDelete: "CASCADE",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW, // Automatically fills the current date
      },
      status: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: "active",
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("attendance");
  },
};