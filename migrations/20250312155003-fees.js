'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fee', {
      sl_no: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'student',
          key: 'admission_no',
        },
      },
      pay_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      pay_method: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paid_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      receipt_no: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("Paid", "Unpaid"),
        allowNull: false,
      },
      feestype: {
        type: Sequelize.ENUM("Tuition", "Books", "Transport", "Uniform", "Multiple"),
        allowNull: false,
      },
      class_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      section_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      razorpay_order_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpay_payment_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      razorpay_signature: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uniform_details: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      transport_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      book_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      tuition_amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      paid_for_items: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      receipt_status: {
        type: Sequelize.ENUM("Pending", "Generated", "Sent"),
        defaultValue: "Pending",
        allowNull: true,
      },
      payment_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop ENUMs first if your dialect requires it
    await queryInterface.dropTable('fee');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fee_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fee_feestype";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_fee_receipt_status";');
  }
};
