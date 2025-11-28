module.exports = (sequelize, DataTypes) => {
  const Warden = sequelize.define(
    "warden",             // <-- model name EXACTLY as you wanted
    {
      warden_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female"),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      assigned_block_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "warden",
      timestamps: false, // because your migration has timestamps but model disabled them
    }
  );

  // Associations
  Warden.associate = (models) => {
    Warden.belongsTo(models.hostel_blocks, {
      foreignKey: "assigned_block_id",
      as: "block",
    });
  };

  return Warden;   // <-- THIS WAS MISSING (mandatory)
};
