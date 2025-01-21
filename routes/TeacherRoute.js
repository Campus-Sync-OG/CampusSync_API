const express = require('express');
const teacherController = require('../controllers/TeacherController');

const router = express.Router();

router.post('/create', teacherController.createTeacher);
router.get('/all', teacherController.getAllTeachers);
router.get('/list/:emp_id', teacherController.getTeacherById);
router.put('/update/:emp_id', teacherController.updateTeacher);
router.delete('/delete/:emp_id', teacherController.softDeleteTeacher);

module.exports = router;
