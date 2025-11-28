// models/hostel_registration.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_registration",
    {
      registration_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
      },

      premium_room: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      preferred_sharing: {
        // stores user selection like 'Single','Double','Triple','3 Sharing'
        type: DataTypes.ENUM(
          "Single",
          "Double",
          "Triple",
          "3 Sharing",
          "4 Sharing"
        ),
        allowNull: true,
      },

      payment_type: {
        // you can expand this list to suit your payment modes
        type: DataTypes.ENUM("Online", "Offline", "Cash", "UPI", "Netbanking"),
        allowNull: true,
      },

      total_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      caution_fee: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.0,
      },

      is_rejoiner: {
        // if student is a re-joiner (caution deposit not applicable)
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      status: {
        type: DataTypes.ENUM("Pending", "Registered", "Rejected", "Cancelled"),
        allowNull: false,
        defaultValue: "Pending",
      },

      remarks: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      registered_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "hostel_registration",
      timestamps: false,
    }
  );
};
