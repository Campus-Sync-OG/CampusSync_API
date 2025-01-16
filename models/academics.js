const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); // Sequelize instance
const Student = require("./student"); // Assuming you have a 'Student' model
const Teacher = require("./teacher"); // Assuming you have a 'Teacher' model

const Academics = sequelize.define("Academics", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  admission_no: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: "student", // Table name
      key: "admission_no",
    },
    onDelete: "CASCADE",
  },
  emp_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    references: {
      model: "teacher", // Table name
      key: "emp_id",
    },
    onDelete: "CASCADE",
  },
  teacher_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  class_grade: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  term_semester: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  academic_year: {
    type: DataTypes.STRING(9),
    allowNull: false,
  },
  marks_obtained: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'academics',
  timestamps: false,
});

// Associations
Academics.belongsTo(Student, {
  foreignKey: 'admission_no',
  targetKey: 'admission_no',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Academics.belongsTo(Teacher, {
  foreignKey: 'emp_id',
  targetKey: 'emp_id',
  onDelete: 'SET NULL', // Or 'CASCADE' depending on your needs
  onUpdate: 'CASCADE',
});

// To allow reverse associations from Student and Teacher
Student.hasMany(Academics, {
  foreignKey: 'admission_no',
  sourceKey: 'admission_no',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Teacher.hasMany(Academics, {
  foreignKey: 'emp_id',
  sourceKey: 'emp_id',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});

module.exports = Academics;
