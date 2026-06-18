module.exports = function (sequelize, DataTypes) {
  return sequelize.define('salary_component', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
        type: DataTypes.ENUM("teacher", "principal", "admin", "operator"),
        allowNull: false,
       // unique: true, // Ensure only one component set per role
        //unique: true, // Ensure only one component set per role
      },
    component_values: {
      type: DataTypes.JSONB, // or JSON
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    tableName: 'salary_component',
    underscored: true,
    timestamps: false,
  });
};
