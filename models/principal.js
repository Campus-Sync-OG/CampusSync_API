const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');

const Principal = sequelize.define('Principal', {
  p_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
    references: {
      model: User,
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
  modelName: 'Principal',
  tableName: 'principal',
  timestamps: false, // Disable createdAt/updatedAt timestamps
});

module.exports = Principal;
