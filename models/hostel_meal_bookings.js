// models/hostel_meal_bookings.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_meal_bookings",
    {
      booking_id: {
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

      menu_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "hostel_meal_menu",
          key: "menu_id",
        },
      },

      status: {
        type: DataTypes.ENUM("Booked", "Availed", "Missed"),
        allowNull: false,
        defaultValue: "Booked",
      },

      qr_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "hostel_meal_bookings",
      timestamps: false,
    }
  );
};
