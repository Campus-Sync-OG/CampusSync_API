const  Student  = require('../models/student');
const  User = require('../models/user'); // Assuming this is the User model where the unique_id is stored


exports.createStudent = async (req, res) => {
  try {
   
    const { admission_no, student_name, password, phone_no, alter_no, dob, gender,status,class:classname,section } = req.body;

   

    const newStudent = await Student.create({
      admission_no,
      student_name,
      password,
      phone_no,
      alter_no,
      dob,
      gender,
      status,
      classname,
      section,
    });

    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a student by admission number
exports.getStudentByAdmissionNo = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const student = await Student.findOne({ where: { admission_no } });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { student_name, password, phone_no, alter_no, dob, gender,status } = req.body;

    const student = await Student.findOne({ where: { admission_no } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Update student details
    student.student_name = student_name || student.student_name;
    student.password = password || student.password;
    student.phone_no = phone_no || student.phone_no;
    student.alter_no = alter_no || student.alter_no;
    student.dob = dob || student.dob;
    student.gender = gender || student.gender;
    student.status=status || student.status;

    // Handle file upload (if any)
   

    await student.save();
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a student

  // Soft delete a student
exports.softDeleteStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;

    // Find the student by admission number
    const student = await Student.findOne({ where: { admission_no } });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Soft delete the student
    await student.destroy();

    res.status(200).json({ message: 'Student soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

