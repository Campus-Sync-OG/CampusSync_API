const { student } = require('../models'); // Changed to lowercase
const { user } = require('../models');   // Changed to lowercase

// Create a student
exports.createStudent = async (req, res) => {
  try {
    const { admission_no, student_name, password, phone_no, alter_no, dob, gender, status, class: classname, section, roll_no } = req.body;

    // Validate required fields
    if (!admission_no || !student_name || !password || !classname || !section || !roll_no) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("Received request body:", req.body); // Debugging log

    // Check if the user exists and their role is 'student'
    const userRecord = await user.findOne({
      where: { unique_id: admission_no, role: 'student' },
    });

    if (!userRecord) {
      return res.status(400).json({
        message: `No user found with unique_id '${admission_no}' and role 'student'`,
      });
    }

    // Create the student record
    const newStudent = await student.create({
      admission_no,
      student_name,
      password,
      phone_no,
      alter_no,
      dob,
      gender,
      status,
      class: classname,
      section,
      roll_no
    });

    res.status(201).json({ message: 'Student created successfully', student: newStudent });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await student.findAll({
      attributes: ['admission_no', 'student_name', 'class', 'section', 'status'], // Includes class and section
    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a student by admission number, class, and section
exports.getStudentByAdmissionNo = async (req, res) => {
  try {
    const { admission_no } = req.params;
   

    const studentRecord = await student.findOne({
      where: { admission_no },
    });

    if (!studentRecord) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(studentRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { student_name, password, phone_no, alter_no, dob, gender, status, class: classname, section } = req.body;

    const studentRecord = await student.findOne({ where: { admission_no } });
    if (!studentRecord) return res.status(404).json({ message: 'Student not found' });

    // Only update fields if a new value is provided
    if (student_name) studentRecord.student_name = student_name;
    if (password) studentRecord.password = password;
    if (phone_no) studentRecord.phone_no = phone_no;
    if (alter_no) studentRecord.alter_no = alter_no;
    if (dob) studentRecord.dob = dob;
    if (gender) studentRecord.gender = gender;
    if (status) studentRecord.status = status;
    if (classname) studentRecord.class = classname;
    if (section) studentRecord.section = section;

    // Save the updated student record
    await studentRecord.save();

    res.status(200).json({
      message: 'Student updated successfully',
      student: studentRecord,
    });
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).json({
      message: 'Error updating student',
      error: error.message,
    });
  }
};

// Soft delete a student
exports.softDeleteStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
   

    // Find the student by admission number, class, and section
    const studentRecord = await student.findOne({
      where: { admission_no},
    });

    if (!studentRecord) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete the student
    await studentRecord.destroy();

    res.status(200).json({ message: 'Student soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


