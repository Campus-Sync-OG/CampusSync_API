"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_allotments", {
      allotment_id: {
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

      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "hostel_rooms",
          key: "room_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },

      request_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("Requested", "Room Allotted", "Rejected"),
        allowNull: false,
        defaultValue: "Requested",
      },

      start_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      end_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_allotments");
  },
};
