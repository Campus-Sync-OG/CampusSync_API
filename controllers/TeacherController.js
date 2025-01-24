const { teacher } = require('../models');
const { user } = require('../models');
const bcrypt = require('bcrypt'); // For password hashing

// Create a new teacher
exports.createTeacher = async (req, res) => {
  try {
    const { emp_id, emp_name, email, subject, password, phone_no, joining_date, is_active, role, status } = req.body;

    if (!emp_id || !emp_name || !password) {
      return res.status(400).json({ message: 'emp_id, emp_name, and password are required' });
    }

    // Validate emp_id against User model
    const matchingUser = await user.findOne({ where: { unique_id: emp_id, role: 'teacher' } });

    if (!matchingUser) {
      return res.status(400).json({ error: 'No matching user found with role teacher' });
    }

    if (matchingUser.unique_id !== emp_id) {
      return res.status(400).json({ error: 'Employee ID does not match the unique ID in the User model' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await teacher.create({
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
    const teachers = await teacher.findAll();
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
    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ teacher: foundTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { emp_name, email, subject, password, phone_no, joining_date, status } = req.body;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields
    foundTeacher.emp_name = emp_name || foundTeacher.emp_name;
    foundTeacher.email = email || foundTeacher.email;
    foundTeacher.subject = subject || foundTeacher.subject;
    foundTeacher.status = status || foundTeacher.status;

    if (password) {
      // Hash the new password before saving
      foundTeacher.password = await bcrypt.hash(password, 10);
    }

    foundTeacher.phone_no = phone_no || foundTeacher.phone_no;
    foundTeacher.joining_date = joining_date || foundTeacher.joining_date;

    await foundTeacher.save();

    res.status(200).json({ message: 'Teacher updated successfully', teacher: foundTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a teacher
exports.softDeleteTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Soft delete the teacher (if you mean marking as inactive)
    await foundTeacher.update({ is_active: false });

    res.status(200).json({ message: 'Teacher soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};



