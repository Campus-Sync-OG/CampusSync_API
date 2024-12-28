const Student = require('../models/student');
const bcrypt = require('bcrypt');

const handleErrorResponse = (res, error) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error', error: error.message });
};

module.exports = {
  // Create a new student
  createStudent: async (req, res) => {
    const { user_class_teacher_id, name, username, password, roll_no, class: classNumber, section } = req.body;

    try {
      if (!name || !username || !password || !roll_no || !classNumber || !section) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const existingStudent = await Student.findOne({ where: { username } });
      if (existingStudent) {
        return res.status(400).json({ message: 'Username already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const student = await Student.create({
        user_class_teacher_id,
        name,
        username,
        password: hashedPassword,
        roll_no,
        class: classNumber,
        section,
      });

      res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Get all students
  getAllStudents: async (req, res) => {
    try {
      const students = await Student.findAll({
        attributes: { exclude: ['password'] },
      });
      res.status(200).json(students);
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Get a single student by ID
  getStudentById: async (req, res) => {
    const { id } = req.params;

    try {
      const student = await Student.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }

      res.status(200).json(student);
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Update a student
  updateStudent: async (req, res) => {
    const { id } = req.params;
    const { user_class_teacher_id, name, username, password, roll_no, class: classNumber, section } = req.body;

    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }

      const updatedData = {
        user_class_teacher_id: user_class_teacher_id || student.user_class_teacher_id,
        name: name || student.name,
        username: username || student.username,
        roll_no: roll_no || student.roll_no,
        class: classNumber || student.class,
        section: section || student.section,
      };

      if (password) {
        updatedData.password = await bcrypt.hash(password, 10);
      }

      await student.update(updatedData);

      res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },

  // Delete a student
  deleteStudent: async (req, res) => {
    const { id } = req.params;

    try {
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(404).json({ message: 'Student not found.' });
      }

      await student.destroy();
      res.status(200).json({ message: 'Student deleted successfully.' });
    } catch (error) {
      handleErrorResponse(res, error);
    }
  },
};
