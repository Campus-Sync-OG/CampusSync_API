module.exports = (sequelize, DataTypes) => {
  return sequelize.define('component_type', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('earning', 'deduction'),
      allowNull: false
    }
  }, {
    tableName: 'component_type',
    timestamps: false
  });
};
