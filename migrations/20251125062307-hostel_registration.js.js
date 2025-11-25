"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("hostel_registration", {
      registration_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
      },

      // hostel_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      //   references: {
      //     model: "hostel",
      //     key: "hostel_id",
      //   },
      // },

      premium_room: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      preferred_sharing: {
        type: Sequelize.ENUM(
          "Single",
          "Double",
          "Triple",
          "3 Sharing",
          "4 Sharing"
        ),
        allowNull: true,
      },

      payment_type: {
        type: Sequelize.ENUM(
          "Online",
          "Offline",
          "Cash",
          "UPI",
          "Netbanking"
        ),
        allowNull: true,
      },

      total_fee: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      caution_fee: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      is_rejoiner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      status: {
        type: Sequelize.ENUM(
          "Pending",
          "Registered",
          "Rejected",
          "Cancelled"
        ),
        allowNull: false,
        defaultValue: "Pending",
      },

      remarks: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      registered_on: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("hostel_registration");
  },
};
