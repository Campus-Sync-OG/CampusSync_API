const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const feedback = sequelize.define("feedback", {
      id: {
          type: DataTypes.INTEGER,
          autoIncrement:true,
          primaryKey: true
      },
      message: {
          type: DataTypes.TEXT,
          allowNull: false
      },
  }, {
      tableName: "feedback",
      timestamps: true
  });

  return feedback;
};
