// models/student_complaints.js

module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "hostel_complaints",
    {
      complaint_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      admission_no: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "student", // FK to students table
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
        // optional image/pdf uploaded by student
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("Pending", "In Review", "Resolved", "Rejected"),
        defaultValue: "Pending",
        allowNull: false,
      },

      // Management Response Fields
      response_message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      responded_by: {
        // Employee ID of admin/warden who replied
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
