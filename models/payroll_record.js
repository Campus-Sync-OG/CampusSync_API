const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  const payroll_record = sequelize.define('payroll_record', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employee_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'teacher',
        key: 'emp_id',
      },
      onDelete: 'CASCADE',
    },
    month: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    earnings: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    deductions: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    net_pay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'processed',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    tableName: 'payroll_record',
    underscored: true,
    timestamps: false,
  });

  return payroll_record;
};
