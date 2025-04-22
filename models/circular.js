module.exports = function (sequelize, DataTypes) {
    return sequelize.define(
      "circular",
      {
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        headline: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        attachment_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "circular",
        timestamps: false, // Set to true if you want createdAt/updatedAt
      }
    );
  };
  