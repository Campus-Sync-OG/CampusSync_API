const { Sequelize } = require('sequelize');
const sequelize = require('../config/sequelize');

const StudentProfile = sequelize.define(
  'student',
  {
    user_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Set user_id as the primary key
      references: {
        model: 'users', // Reference the users table
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    student_name: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: false,
    },
    class: {
      type: Sequelize.DataTypes.STRING(50),
      allowNull: true,
    },
    section: {
      type: Sequelize.DataTypes.STRING(10),
      allowNull: true,
    },
    parent_user_id: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    },
    admission_date: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    },
    transportation_route: {
      type: Sequelize.DataTypes.STRING(255),
      allowNull: true,
    },
    gps_tracking_id: {
      type: Sequelize.DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    timestamps: true,
    underscored: true,
    
    freezeTableName: true, // Prevent Sequelize from pluralizing table name
  }
);

module.exports = StudentProfile;
