const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = (sequelize, DataTypes) => {
  const bus = sequelize.define('bus', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    bus_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    route_name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    freezeTableName: true  // 👈 This prevents Sequelize from pluralizing table name
  });

  return bus;
};
