"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wardens", {
      warden_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "user",
          key: "unique_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      warden_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      assigned_block_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "hostel_blocks",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("wardens");
  },
};
