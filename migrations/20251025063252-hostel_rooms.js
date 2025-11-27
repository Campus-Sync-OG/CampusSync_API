"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_rooms", {
      room_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      block_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "hostel_blocks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      room_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      sharing_type: {
        type: Sequelize.ENUM("Single", "2 Sharing", "3 Sharing", "4 Sharing"),
        allowNull: false,
      },

      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_rooms");
  },
};
