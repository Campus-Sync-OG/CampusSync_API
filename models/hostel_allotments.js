// models/hostel_allotments.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_allotments",
    {
      allotment_id: {
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

      room_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "hostel_rooms",
          key: "room_id",
        },
      },

      request_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("Requested", "Room Allotted", "Rejected"),
        allowNull: false,
        defaultValue: "Requested",
      },

      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "hostel_allotments",
      timestamps: false,
    }
  );
};
