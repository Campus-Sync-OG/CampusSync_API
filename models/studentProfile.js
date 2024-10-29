const Sequelize = require('sequelize');
const StudentProfile = sequelize.define('student', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users', // refers to table name
        key: 'id'
      },
      allowNull: false,
    },
    student_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    parent_user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    admission_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transportation_route: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gps_tracking_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = StudentProfile;
  