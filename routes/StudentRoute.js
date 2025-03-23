const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const Auth = require("../middleware/authMiddleware");
const { upload } = require('../controllers/studentController');

// Create a new student
router.post('/create', studentController.createStudent);

// Get all students
router.get('/list', Auth.verifyToken, studentController.getAllStudents);

// Get a student by admission_no
router.get('/:admission_no', Auth.verifyToken, studentController.getStudentByAdmissionNo);

// Update a student by admission_no
router.put("/update/:admission_no", upload.single("image"), studentController.updateStudent)

// Delete a student by admission_no
router.delete('/delete/:admission_no', Auth.verifyToken, studentController.deleteStudentImage);

module.exports = router;
