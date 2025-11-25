"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_meal_bookings", {
      booking_id: {
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

      menu_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "hostel_meal_menu",
          key: "menu_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      status: {
        type: Sequelize.ENUM("Booked", "Availed", "Missed"),
        allowNull: false,
        defaultValue: "Booked",
      },

      qr_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_meal_bookings");
  },
};
