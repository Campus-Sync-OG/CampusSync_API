module.exports = function (sequelize, DataTypes) {
  return sequelize.define("fee_plan", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    section_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admission_no: {
      type: DataTypes.STRING,
      allowNull: true, // ✅ Optional - only if specific to student
      references: {
        model: "student",
        key: "admission_no",
      }
    },
    feestype: {
      type: DataTypes.ENUM("Tuition", "Books", "Transport", "Uniform", "All"),
      allowNull: false,
    },
    total_fee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    item_details: {
      type: DataTypes.JSON, // ✅ Use JSON data type
      allowNull: true, // Not required for all fee types
    },
  }, {
    sequelize,
    paranoid: true,
    tableName: "fee_plan",
    timestamps: false
  });
};
