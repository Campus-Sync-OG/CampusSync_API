"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_complaints", {
      complaint_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
      },

      complaint_type: {
        type: Sequelize.ENUM(
          "Hostel",
          "Food",
          "Cleanliness",
          "Discipline",
          "Maintenance",
          "Other"
        ),
        allowNull: false,
      },

      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      attachment_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("Pending", "In Review", "Resolved", "Rejected"),
        allowNull: false,
        defaultValue: "Pending",
      },

      response_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      responded_by: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "user",
          key: "unique_id",
        },
      },

      responded_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_on: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_complaints");
  },
};
