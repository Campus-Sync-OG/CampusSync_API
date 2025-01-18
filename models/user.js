const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Your Sequelize instance

const User = sequelize.define(
  'User',
  {
    unique_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('student', 'teacher', 'principal'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active','inactive'),
      allowNull: false,
      defaultValue: 'active', // Default value for status
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    tableName: 'user',
    timestamps: false,
    hooks: {
      beforeValidate: async (user) => {
        if (!user.unique_id) {
          let prefix = '';
          switch (user.role) {
            case 'student':
              prefix = 'S';
              break;
            case 'teacher':
              prefix = 'T';
              break;
            case 'principal':
              prefix = 'P';
              break;
            default:
              throw new Error('Invalid role specified');
          }

          const maxUniqueId = await user.constructor.findOne({
            attributes: [[sequelize.fn('MAX', sequelize.col('unique_id')), 'max_id']],
            raw: true,
          });

          let newSerialNumber = 1;
          if (maxUniqueId.max_id) {
            const lastSerial = parseInt(maxUniqueId.max_id.split('-')[1], 10);
            newSerialNumber = lastSerial + 1;
          }

          user.unique_id = `${prefix}-${String(newSerialNumber).padStart(6, '0')}`;
        }
      },
    },
  }
);

module.exports = User;
