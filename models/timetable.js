const { Sequelize } = require("sequelize");
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('timetable', {
    class: {
      type: DataTypes.STRING,
      allowNull: false
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'student',
        key: 'admission_no'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },  
  }, {
    tableName: 'timetable'
  });
};
