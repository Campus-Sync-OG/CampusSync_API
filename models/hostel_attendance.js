// models/hostel_attendance.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_attendance",
    {
      attendance_id: {
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

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("Present", "Absent"),
        allowNull: false,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "hostel_attendance",
      timestamps: false,
    }
  );
};
