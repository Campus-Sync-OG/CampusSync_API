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
        type: Sequelize.ENUM("admin", "operator", "student", "teacher", "principal", "warden"),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      base_salary: {
        type: Sequelize.FLOAT,
        allowNull: true, // or false depending on your logic
      },
      first_time_login: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_password_reset: {
        type: Sequelize.DATE,
        allowNull: true,
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
