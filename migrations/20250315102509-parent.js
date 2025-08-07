'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("parent", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "student", // Reference to the Student model
          key: "admission_no",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      father_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      father_contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      father_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mother_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mother_contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mother_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      religion: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      father_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mother_image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("parent");
  },
};
