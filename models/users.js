const { Sequelize ,DataTypes} = require('sequelize');
const sequelize = require('../config/sequelize');

const { v4: uuidv4 } = require('uuid');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4, // Automatically generates a UUID for each new user
  },
  uname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dept: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
  tableName: 'users',
});

module.exports = User;
