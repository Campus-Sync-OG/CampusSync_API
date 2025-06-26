module.exports = (sequelize, DataTypes) => {
  return sequelize.define('teacher_leave_application', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    emp_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'teacher',
        key: 'emp_id',
      },
      OnDelete: 'CASCADE', // if teacher is deleted, their leave applications are also deleted
      OnUpdate: 'CASCADE', // if emp_id is updated, it reflects in leave applications
    },
    from_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    to_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    leave_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
      defaultValue: 'Pending',
    },
    reviewed_by: {
      type: DataTypes.STRING,
      allowNull: true, // principal's unique_id (if not using foreign key)
    },
 
  }, {
    tableName: 'teacher_leave_application',
    timestamps: true,
  });
};
