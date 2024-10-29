const Sequelize = require('sequelize');
const Attendance = sequelize.define('attendance', {
    student_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late'),
      allowNull: false,
    },
    class: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = Attendance;
  