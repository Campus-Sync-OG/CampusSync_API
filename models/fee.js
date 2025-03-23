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
        model: "student", // Table name in the database
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
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deletedAt: { 
      type: DataTypes.DATE, 
      allowNull: true },
  }, {
    sequelize,
    paranoid: true,
    tableName: "fee",
    timestamps: false, // Disable createdAt/updatedAt timestamps
  });
};