const { Sequelize } = require("sequelize");
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes)  {
    return sequelize.define('timetable', {
      classSectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'class_section',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
      }
    }, {
      tableName: 'timetable'
    },
  
  );
  
  
  };
  