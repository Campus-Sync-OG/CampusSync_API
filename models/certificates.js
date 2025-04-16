
const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define('certificates',  {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'student',
          key: 'admission_no',
        }
      },
      certificate_type: {
        type: DataTypes.ENUM(
          'bonafide',
          'transfer',
          'character',
          'study',
          'migration',
          'scholarship'
        ),
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      }
    }, {
      tableName: 'certificates',
      timestamps: true,
    });
  
   
  };
  