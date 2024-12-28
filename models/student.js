const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { v4: uuidv4 } = require('uuid');

const Student = sequelize.define('Student', {
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true,
    defaultValue: uuidv4, 
  },
  user_class_teacher_id: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable based on your diagram
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roll_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 
}, {
  timestamps: true, 
  underscored: true,// Since the diagram explicitly includes `created_at`
  tableName: 'student',
});

module.exports = Student;
