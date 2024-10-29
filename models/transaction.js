const Sequelize = require('sequelize');
const Transaction = sequelize.define('transaction', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    transaction_type: {
      type: DataTypes.ENUM('fee', 'miscellaneous'),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'online_transfer'),
      allowNull: true,
    },
    receipt_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = Transaction;
  