const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('principal',
    {
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
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_no: {
        type: DataTypes.BIGINT,
        allowNull: true,
        validate: {
          isNumeric: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      school_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      joining_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    }, {
    sequelize,
    tableName: 'principal',
    timestamps: false, // Disable createdAt/updatedAt timestamps
  }
  );
};


