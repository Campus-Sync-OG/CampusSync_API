const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('examformat',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    exam_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'examformat',
    timestamps: false, // Disable createdAt/updatedAt timestamps
  }
  );
};

