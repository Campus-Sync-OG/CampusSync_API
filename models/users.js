const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "users",
  {
    user_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      primaryKey: true,       // Primary key added
      autoIncrement: true,    // Auto-increment added
    },
    email: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: Sequelize.DataTypes.ENUM("student", "parent", "staff"),
      allowNull: false,
    },
    status: {
      type: Sequelize.DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
