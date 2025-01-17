const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');

// Route to create a new principal
router.post('/create', principalController.createPrincipal);

// Routes for managing teachers
router.put('/teacher/status/:teacher_id', principalController.updateTeacherStatus);

// Routes for managing students
router.put('/student/status/:student_id', principalController.updateStudentStatus);

// Route to allow the principal to add a teacher
router.post('/addTeacher/:principal_id', principalController.addTeacher);

// Route to allow the principal to add a student
router.post('/addStudent/:principal_id', principalController.addStudent);

// Routes to get all teachers and students managed by the principal
router.get('/teachers', principalController.getTeachers);
router.get('/students', principalController.getStudents);

module.exports = router;
