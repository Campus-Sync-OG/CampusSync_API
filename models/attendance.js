const { Sequelize,DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/sequelize');
const Student = require('./student'); // Ensure this matches your actual file structure

const Attendance = sequelize.define(
  'Attendance',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4, // Automatically generate UUIDs
      primaryKey: true,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.UUID,
      references: {
        model: 'student',
        key: 'id',
      },
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN, // Assuming status is an integer (e.g., 1 for present, 0 for absent)
      allowNull: false,
    },
    report_date: {
      type: DataTypes.DATEONLY, // Represents only the date (no time)
      allowNull: false,
    },
    user_class_teacher_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    timestamps: true, // Automatically includes createdAt and updatedAt fields
    underscored: true, // Use camel case for column names
    tableName: 'attendance', // Ensure this matches your database table name
  }
);



module.exports = Attendance;
