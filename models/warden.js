module.exports = (sequelize, DataTypes) => {
  const Warden = sequelize.define("warden", {
    warden_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [10, 15],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    assigned_block_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "hostel_blocks",
        key: "id",
      },
    }
  });

  Warden.associate = (models) => {
    Warden.belongsTo(models.hostel_blocks, {
      foreignKey: "assigned_block_id",
      as: "block",
    });
  };

  return Warden;
};
