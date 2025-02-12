const express = require('express');
const teacherController = require('../controllers/TeacherController');
const csvController=require('../controllers/CsvController');

const router = express.Router();

router.post('/create', teacherController.createTeacher);
router.get('/all', teacherController.getAllTeachers);
router.get('/list/:emp_id', teacherController.getTeacherById);
router.put('/update/:emp_id', teacherController.updateTeacher);
router.delete('/delete/:emp_id', teacherController.softDeleteTeacher);
router.get('/:emp_id/students', teacherController.getStudentsByClassAndSection);
router.post("/:emp_id/students/marks", teacherController.addStudentMarks);

router.post("/upload/academics", csvController.upload.single("file"), csvController.uploadAcademicsCSV);

module.exports = router;
