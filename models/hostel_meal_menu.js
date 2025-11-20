// models/hostel_meal_menu.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_meal_menu",
    {
      menu_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      meal_type: {
        type: DataTypes.ENUM("Breakfast", "Lunch", "Dinner"),
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      items: {
        type: DataTypes.JSON,
        allowNull: false, // ["Rice", "Dal", "Curd"]
      },
    },
    {
      tableName: "hostel_meal_menu",
      timestamps: false,
    }
  );
};
