const { Sequelize } = require("sequelize");

module.exports = function (sequelize, DataTypes) {
  return sequelize.define("fee", {
    sl_no: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "student",
        key: "admission_no",
      },
    },
    pay_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    pay_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Online", // Default to Cash
    },
    paid_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    receipt_no: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Paid", "Unpaid"),
      allowNull: false,
      defaultValue: "Unpaid", // Default to Unpaid
    },

    // ✅ Updated to ENUM type
    feestype: {
      type: DataTypes.ENUM("Tuition", "Books", "Transport", "Uniform", "Multiple"),
      allowNull: false,
    },

    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Razorpay fields
    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Fee breakdowns
    uniform_details: {
      type: DataTypes.JSON, // e.g., { shirt: 500, pant: 600 }
      allowNull: true,
    },
    transport_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    book_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tuition_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    // Optional clarity fields
    paid_for_items: {
      type: DataTypes.ARRAY(DataTypes.STRING), // e.g., ['Books', 'Shirt', 'Pant']
      allowNull: true,
    },
    receipt_status: {
      type: DataTypes.ENUM("Pending", "Generated", "Sent"),
      defaultValue: "Pending",
    },
    payment_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    paranoid: true,
    tableName: "fee",
    timestamps:false,
  });
};
