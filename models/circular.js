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
      class_name: {
        type: DataTypes.STRING,
        allowNull: true, // Set to false if class_name is mandatory
      },
      section:{
        type:DataTypes.STRING,
        allowNull:true, // Set to false if section is mandatory
      },
      admission_no: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "student",
          key: "admission_no",
        },
      },
      emp_id:{
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "teacher",
          key: "emp_id",
        },
      },
    },
    {
      sequelize,
      tableName: "circular",
      timestamps: false, // Set to true if you want createdAt/updatedAt
    }
  );
};
