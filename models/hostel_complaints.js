// models/student_complaints.js

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_complaints",
    {
      complaint_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student",
          key: "admission_no",
        },
      },

      complaint_type: {
        type: DataTypes.ENUM(
          "Hostel",
          "Food",
          "Cleanliness",
          "Discipline",
          "Maintenance",
          "Other"
        ),
        allowNull: false,
      },

      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      attachment_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("Pending", "In Review", "Resolved", "Rejected"),
        defaultValue: "Pending",
        allowNull: false,
      },

      response_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      responded_by: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "employee",
          key: "emp_id",
        },
      },

      responded_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      created_on: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updated_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "hostel_complaints",
      timestamps: false,
    }
  );
};
