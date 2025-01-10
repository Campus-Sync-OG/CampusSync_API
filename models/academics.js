const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Sequelize instance
const Student = require('./student'); // Import Student model
const Teacher = require('./teacher'); // Import Teacher model

const Academics = sequelize.define('Academics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique:true,
  },
  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique:true,
  },
  marks_obtained: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  total_marks: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'academics',
  timestamps: false,
});

// Relationships

module.exports = Academics;
