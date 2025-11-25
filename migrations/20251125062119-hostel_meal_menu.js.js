"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_meal_menu", {
      menu_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      meal_type: {
        type: Sequelize.ENUM("Breakfast", "Lunch", "Dinner"),
        allowNull: false,
      },

      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      items: {
        type: Sequelize.JSON,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_meal_menu");
  },
};
