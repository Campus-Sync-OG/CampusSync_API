// models/hostel_rooms.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_rooms",
    {
      room_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      block_id: {
        type: DataTypes.INTEGER,   // updated because hostel_blocks.id is INTEGER
        allowNull: false,
        references: {
          model: "hostel_blocks",
          key: "id",
        },
      },

      room_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      sharing_type: {
        type: DataTypes.ENUM("Single", "2 Sharing", "3 Sharing", "4 Sharing"),
        allowNull: false,
      },

      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: "hostel_rooms",
      timestamps: false,
    }
  );
};
