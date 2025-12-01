"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_blocks", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      block_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      block_type: {
        type: Sequelize.ENUM("Male", "Female"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_blocks");
  },
};
