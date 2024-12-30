'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Academic extends Model {
    static associate(models) {
      Academic.belongsTo(models.Student, {
        foreignKey: 'student_id',
        onDelete: 'CASCADE',
      });
    }
  }

  Academic.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      marks_obtain: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      total_marks: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      term: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      exam_date: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Academic',
      tableName: 'academics',
      timestamps: true,
    }
  );

  return Academic;
};
