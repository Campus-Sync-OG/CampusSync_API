"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insert Users
    await queryInterface.bulkInsert("user", [
      {
        unique_id: "U1001",
        name: "Student One",
        password: "password123", // In a real case, password should be hashed
        role: "student",
      },
      {
        unique_id: "U1002",
        name: "Student Two",
        password: "password123",
        role: "student",
      },
      {
        unique_id: "U2001",
        name: "Teacher One",
        password: "password123",
        role: "teacher",
      },
      {
        unique_id: "U2002",
        name: "Teacher Two",
        password: "password123",
        role: "teacher",
      },
      {
        unique_id: "U3001",
        name: "Principal",
        password: "password123",
        role: "principal",
      },
    ]);

    // Insert Teachers
    await queryInterface.bulkInsert("teacher", [
      {
        emp_id: "T2001",
        emp_name: "Teacher One",
        email: "teacher1@example.com",
        subject: "Math",
        password: "password123",
        phone_no: "9876543210",
        joining_date: new Date(),
        is_active: true,
      },
      {
        emp_id: "T2002",
        emp_name: "Teacher Two",
        email: "teacher2@example.com",
        subject: "Science",
        password: "password123",
        phone_no: "9876543211",
        joining_date: new Date(),
        is_active: true,
      },
    ]);

    // Insert Students
    await queryInterface.bulkInsert("student", [
      {
        admission_no: "S1001",
        student_name: "Student One",
        password: "password123",
        phone_no: "9876543210",
        alter_no: "9876543211",
        student_photo: null,
        dob: new Date("2005-05-15"),
        gender: "Male",
      },
      {
        admission_no: "S1002",
        student_name: "Student Two",
        password: "password123",
        phone_no: "9876543212",
        alter_no: "9876543213",
        student_photo: null,
        dob: new Date("2006-06-20"),
        gender: "Female",
      },
    ]);

    // Insert Principals
    await queryInterface.bulkInsert("principal", [
      {
        emp_id: "P3001",
        name: "Principal",
        password: "password123",
        phone_no: "9876543215",
        email: "principal@example.com",
        school_name: "ABC School",
        add_teacher: true,
        joining_date: new Date(),
      },
    ]);

    // Insert Academics Data
    await queryInterface.bulkInsert("academics", [
      {
        admission_no: "S1001",
        emp_id: "T2001",
        teacher_name: "Teacher One",
        subject: "Math",
        class_grade: "10",
        term_semester: "Semester 1",
        academic_year: "2024-2025",
        marks_obtained: 85,
        total_marks: 100,
        exam_date: new Date("2024-12-15"),
      },
      {
        admission_no: "S1002",
        emp_id: "T2002",
        teacher_name: "Teacher Two",
        subject: "Science",
        class_grade: "10",
        term_semester: "Semester 1",
        academic_year: "2024-2025",
        marks_obtained: 90,
        total_marks: 100,
        exam_date: new Date("2024-12-16"),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Reverse seed data
    await queryInterface.bulkDelete("academics", null, {});
    await queryInterface.bulkDelete("principal", null, {});
    await queryInterface.bulkDelete("student", null, {});
    await queryInterface.bulkDelete("teacher", null, {});
    await queryInterface.bulkDelete("user", null, {});
  },
};
