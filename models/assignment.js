const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = function (sequelize, DataTypes) {
  return sequelize.define('student', {
    teacherName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    attachment: {
        type: DataTypes.STRING, // Stores file path of the uploaded PDF
        allowNull: true,
    },
    admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'student', // Reference the Student model
            key: 'admission_no', // Foreign key column in the Student model
        },
    },
    emp_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'teacher', // Reference the Teacher model
            key: 'emp_id', // Foreign key column in the Teacher model
        },
    }, 
  }, {
    sequelize,
    tableName: 'assignment',
    timestamps: false, // Disable createdAt/updatedAt timestamps
  }
  );
};

