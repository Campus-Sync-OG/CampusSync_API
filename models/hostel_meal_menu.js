// models/hostel_meal_menu.js
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_meal_menu",
    {
      menu_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
        allowNull: false,
      },
    },
    {
      tableName: "hostel_meal_menu",
      timestamps: false,
    }
  );
};
