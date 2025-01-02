const express = require('express');
const router = express.Router();
const studentController = require('../controllers/StudentController');
const csvController=require('../controllers/CsvController');

// Create a new student
router.post('/create', studentController.createStudent);

// Get all students
router.get('/list', studentController.getAllStudents);

// Get a single student by ID
router.get('/students/:id', studentController.getStudentById);

// Update a student by ID
router.put('/update/:id', studentController.updateStudent);

// Delete a student by ID
router.delete('/delete/:id', studentController.deleteStudent);

router.post('/students/upload-csv', csvController.uploadStudentCSV);

module.exports = router;
