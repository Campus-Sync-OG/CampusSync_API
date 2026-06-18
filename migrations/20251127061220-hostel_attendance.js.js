"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_attendance", {
      attendance_id: {
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

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("Present", "Absent"),
        allowNull: false,
      },

      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("hostel_attendance");
  },
};
