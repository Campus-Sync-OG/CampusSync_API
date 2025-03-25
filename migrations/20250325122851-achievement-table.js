"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("achievement", {
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
      },
      className: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      section: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      // Imageurl: {
      //   type: Sequelize.TEXT, // Stores multiple image URLs as a string
      //   allowNull: true,
      // },
      Certificateurl: {
        type: Sequelize.TEXT, // Stores multiple certificate URLs as a string
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("achievement");
  },
};
