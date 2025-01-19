const Teacher = require('../models/teacher');
const User = require('../models/user');
const bcrypt = require('bcrypt'); // For password hashing

// Create a new teacher
exports.createTeacher = async (req, res) => {
  try {
    const { emp_id, emp_name, email, subject, password, phone_no, joining_date, is_active, role,status } = req.body;

    if (!emp_id || !emp_name || !password) {
      return res.status(400).json({ message: 'emp_id, emp_name, and password are required' });
    }

    // Validate emp_id against User model
    const user = await User.findOne({ where: { unique_id: emp_id, role: 'teacher' } });

    if (!user) {
      return res.status(400).json({ error: 'No matching user found with role teacher' });
    }

    if (user.unique_id !== emp_id) {
      return res.status(400).json({ error: 'Employee ID does not match the unique ID in the User model' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await Teacher.create({
      emp_id,
      emp_name,
      email,
      subject,
      password: hashedPassword,
      phone_no,
      joining_date,
      is_active,
      role,
      status,
    });

    res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found' });
    }

    res.status(200).json({ teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a teacher by emp_id
exports.getTeacherById = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const teacher = await Teacher.findOne({ where: { emp_id } });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { emp_name, email, subject, password, phone_no, joining_date, status} = req.body;

    const teacher = await Teacher.findOne({ where: { emp_id } });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields
    teacher.emp_name = emp_name || teacher.emp_name;
    teacher.email = email || teacher.email;
    teacher.subject = subject || teacher.subject;

    if (password) {
      // Hash the new password before saving
      teacher.password = await bcrypt.hash(password, 10);
    }

    teacher.phone_no = phone_no || teacher.phone_no;
    teacher.joining_date = joining_date || teacher.joining_date;
    teacher.is_active = is_active !== undefined ? is_active : teacher.is_active;

    await teacher.save();

    res.status(200).json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a teacher
exports.softDeleteTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;

    // Find the student by admission number
    const student = await Student.findOne({ where: { emp_id } });

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
