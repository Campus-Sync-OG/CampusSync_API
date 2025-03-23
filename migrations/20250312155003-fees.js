'use strict';

const sequelize = require("../config/sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable("fee", {
          sl_no: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              allowNull: false,
              primaryKey: true
          },
          admission_no: {
            type: Sequelize.STRING,
            allowNull: false,
            references: {
                model: "student", // Table name in DB
                key: "admission_no"
            },
            
        },
          pay_date: {
              type: Sequelize.DATE,
              allowNull: false
          },
          pay_method: {
              type: Sequelize.STRING,
              allowNull: false
          },
          paid_amount: {
              type: Sequelize.FLOAT,
              allowNull: false
          },
          receipt_no: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true
          },
          status: {
              type: Sequelize.ENUM("Paid", "Unpaid"),
              allowNull: false
          },
          due_date: {
              type: Sequelize.DATE,
              allowNull: false
          },
          createdAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          updatedAt: {
              allowNull: false,
              type: Sequelize.DATE
          },
          deletedAt: {
            allowNull: true,
            type: Sequelize.DATE
        }
      });
  },
  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable("fee");
  }
};