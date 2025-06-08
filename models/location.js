module.exports = (sequelize, DataTypes) => {
  const location = sequelize.define('location', {
    bus_id: {
      type: DataTypes.STRING,
      primaryKey: true,
      references: {
        model: 'bus', // Default table name for Bus model (plural, capitalized)
        key: 'id'
      }
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
     tableName: 'location',
    timestamps: false // since you define updated_at manually
  });

  return location;
};
