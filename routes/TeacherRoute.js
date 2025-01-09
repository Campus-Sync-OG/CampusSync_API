const express = require('express');
const teacherController = require('../controllers/TeacherController');

const router = express.Router();

router.post('/create', teacherController.createTeacher);
router.get('/list', teacherController.getAllTeachers);
router.get('/list/:emp_id', teacherController.getTeacherById);
router.put('/teachers/:emp_id', teacherController.updateTeacher);
router.delete('/teachers/:emp_id', teacherController.deleteTeacher);

module.exports = router;
