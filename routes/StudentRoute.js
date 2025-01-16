const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Create a new student
router.post('/create', studentController.createStudent);

// Get all students
router.get('/list', studentController.getAllStudents);

// Get a student by admission_no
router.get('/:admission_no', studentController.getStudentByAdmissionNo);

// Update a student by admission_no
router.put('/:admission_no', studentController.updateStudent);

// Delete a student by admission_no
router.delete('/:admission_no', studentController.deleteStudent);

module.exports = router;
