const express = require('express');
const router = express.Router();
const studentProfileController = require('../controllers/studentController');

// Get all students
router.get('/list', studentProfileController.getAllStudents);

// Get a single student by ID
router.get('/profile/:id', studentProfileController.getStudentById);

// Create a new student
router.post('/profile', studentProfileController.createStudent);

// Update a student by ID
router.put('/profile/:id', studentProfileController.updateStudent);

// Delete a student by ID
router.delete('/profile/:id', studentProfileController.deleteStudent);

module.exports = router;
