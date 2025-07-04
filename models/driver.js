module.exports = (sequelize, DataTypes) => {
  const driver = sequelize.define('driver', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    license_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bus_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'bus', // ✔ This must match the actual table name created in migration
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'driver', // 👈 IMPORTANT: matches the name used in migration
    timestamps: true
  });

  return driver;
};
