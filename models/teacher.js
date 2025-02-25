const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('teacher',
    {
      emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'user', // Foreign key referencing User table
          key: 'unique_id',
        },
      },
      emp_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
        references:{
          model:'subject',
          key:'subject_name',
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone_no: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isNumeric: true,
        },
      },
      joining_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      role: {
        type: DataTypes.ENUM('classteacher', 'subjectteacher'),
        allowNull: false,
        defaultValue: 'classteacher',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active', // Default value for status
      }
    },
    {
      sequelize,
      tableName: 'teacher',
      timestamps: false, // Disable createdAt/updatedAt timestamps
    }
  );
};

