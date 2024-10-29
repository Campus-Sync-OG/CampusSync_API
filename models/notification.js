const Sequelize = require('sequelize');
const Notification = sequelize.define('notification', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false,
    },
    notification_type: {
      type: DataTypes.ENUM('holiday', 'homework', 'event', 'fee_reminder', 'PTM'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('unread', 'read'),
      defaultValue: 'unread',
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = Notification;
  