"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_leave_requests", {
      leave_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      reason: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      visit_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("Pending", "Approved", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_leave_requests");
  },
};
