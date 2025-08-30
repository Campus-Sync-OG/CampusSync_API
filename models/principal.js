const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('principal',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,   // ✅ New primary key
      },
      p_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: 'user',
          key: 'unique_id',
        }
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_no: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
          isNumeric: true,
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      school_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        }
      },
      images: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      joining_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    }, {
    sequelize,
    tableName: 'principal',
    timestamps: false,
  });
};
