const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { v4: uuidv4 } = require('uuid');

const Academic = sequelize.define('Academic', {
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4, 
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  marks_obtain: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  term: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false, // Automatically adds `createdAt` and `updatedAt` fields
  underscored: true, // Since the diagram explicitly includes `created_at`
  tableName: 'academics',
});

module.exports = Academic;
