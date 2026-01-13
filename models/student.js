const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');
const { on } = require('pdfkit');


module.exports = function (sequelize, DataTypes) {
  return sequelize.define('student', {
    admission_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      references: {
        model: 'user',
        key: 'unique_id',
      }
    },
    student_name: {
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
    alter_no: {
      type: DataTypes.BIGINT,
      allowNull: true,
      validate: {
        isNumeric: true,
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: [['Male', 'Female']],
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active', // Default value for status
    },
    class: {
      type: DataTypes.STRING,
      allowNull: true,
   
  
    },
    section: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roll_no:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    images: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_hosteller:{
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
   },
  }, {
    sequelize,
    tableName: 'student',
    timestamps: false,
  }
  );
};


