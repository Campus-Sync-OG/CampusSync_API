// models/hostel_leave_requests.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_leave_requests",
    {
      leave_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
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

      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      visit_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
        defaultValue: "Pending",
      },
    },
    {
      tableName: "hostel_leave_requests",
      timestamps: false,
    }
  );
};
