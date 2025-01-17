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
    
          let isUnique = false;
          let uniqueId = '';
          while (!isUnique) {
            const randomDigits = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit random number
            uniqueId = `${prefix}-${randomDigits}`;
    
            // Check if the generated unique_id already exists
            const existingUser = await user.constructor.findOne({ where: { unique_id: uniqueId } });
            if (!existingUser) {
              isUnique = true; // The generated ID is unique
            }
          }
    
          user.unique_id = uniqueId; // Assign the unique ID
        }
      },
    },
    
  }
);

module.exports = User;
