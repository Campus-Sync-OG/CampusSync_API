"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user", {
      unique_id: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
      },
      role: {
        type: Sequelize.ENUM("student", "teacher", "principal"),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the table and clean up ENUM values
    await queryInterface.dropTable("user");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_user_role";'
    ); // Cleanup ENUM type
  },
};
