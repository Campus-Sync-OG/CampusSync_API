const Sequelize = require('sequelize');
const ParentProfile = sequelize.define('parent', {
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      },
      allowNull: false,
    },
    parent_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true,
  });
  
  module.exports = ParentProfile;
  