const StudentProfile = require('../models/studentProfile');

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await StudentProfile.findAll(); // Fetch all students
    res.status(200).json(students); // Corrected from `student` to `students`
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ where: { user_id: req.params.id } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new student
exports.createStudent = async (req, res) => {
  try {
    const student = await StudentProfile.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a student by ID
exports.updateStudent = async (req, res) => {
  try {
    const updated = await StudentProfile.update(req.body, { where: { user_id: req.params.id } });
    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await StudentProfile.destroy({ where: { user_id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
