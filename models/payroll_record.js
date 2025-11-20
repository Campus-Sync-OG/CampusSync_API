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
      type: DataTypes.STRING, // or DATEONLY if you prefer "2025-07-01"
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
    earnings_breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Example: { "Basic": 20000, "HRA": 12000 }
    },
    deductions_breakdown: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Example: { "PF": 1800 }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'processed', // processed, failed, pending, etc.
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
