const express = require('express');
const teacherController = require('../controllers/TeacherController');
const csvController = require('../controllers/CsvController');
const Auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/create', Auth.verifyToken, teacherController.createTeacher);
router.get('/all', Auth.verifyToken, teacherController.getAllTeachers);
router.get('/list/:emp_id', Auth.verifyToken, teacherController.getTeacherById);
router.put('/update/:emp_id', Auth.verifyToken, teacherController.updateTeacher);
router.delete('/delete/:emp_id', Auth.verifyToken, teacherController.softDeleteTeacher);
router.get('/:emp_id/students', Auth.verifyToken, teacherController.getStudentsByClassAndSection);
router.post('/:emp_id/students/marks', Auth.verifyToken, teacherController.addStudentMarks);

router.post('/upload/academics', Auth.verifyToken, csvController.upload.single("file"), csvController.uploadAcademicsCSV);

router.post('/:emp_id/upload-attendance', Auth.verifyToken, teacherController.uploadAttendance);

router.put('/:emp_id', Auth.verifyToken, teacherController.updateAcademicRecord);

router.put('/attendance-update/:emp_id', Auth.verifyToken, teacherController.updateAttendance);

router.post('/:emp_id/assignment', teacherController.uploadAssignment);

router.put('/:emp_id/update/assignment', Auth.verifyToken, teacherController.updateAssignment);

router.put("/update-roll/:emp_id", Auth.verifyToken, teacherController.updateStudentRollNo);

module.exports = router;
