module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "attendance",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student", // Table name
          key: "admission_no",
        },
      },
      class: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      section: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      period: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      attendance_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'day-wise',
      },

      percentage:{
        type: DataTypes.FLOAT,
        allowNull: true, // Assuming percentage can be optional
        
      },

      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [["present", "absent"]],
        },
        defaultValue: "present",
        onDelete: "CASCADE", // if teacher is deleted, their attendance records are also deleted  
        onUpdate: "CASCADE", // if emp_id is updated, it reflects in attendance records
      },
    },
    {
      tableName: "attendance",
      timestamps: false,
    }
  );
};
