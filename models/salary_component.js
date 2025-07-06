module.exports = function (sequelize, DataTypes) {
  return sequelize.define('salary_component', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    structure_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // One set per structure
      references: {
        model: 'salary_structure',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
