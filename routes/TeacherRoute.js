const express = require('express');
const teacherController = require('../controllers/TeacherController');
const csvController = require('../controllers/CsvController');
const Auth = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer();

const router = express.Router();

// Route to create a new teacher
router.post('/create', teacherController.createTeacher);

// Route to get all teachers (requires authentication)
router.get('/all',  teacherController.getAllTeachers);

// Route to get a teacher by their employee ID (requires authentication)
router.get('/:emp_id', Auth.verifyToken, teacherController.getTeacherById);

// Route to update a teacher's details by employee ID (requires authentication)
router.put('/update/:emp_id', Auth.verifyToken, teacherController.updateTeacher);

// Route to soft delete a teacher (mark as inactive) by employee ID (requires authentication)
router.delete('/delete/:emp_id', Auth.verifyToken, teacherController.softDeleteTeacher);

// Route to get students assigned to a teacher based on class and section (requires authentication)
router.get('/:emp_id/students', Auth.verifyToken, teacherController.getStudentsByClassAndSection);

// Route to add student marks by a teacher (requires authentication)
router.post('/:emp_id/students/marks',  teacherController.addStudentMarks);

// Route to upload academic records via CSV file (requires authentication)
router.post('/upload/academics', Auth.verifyToken, csvController.upload.single("file"), csvController.uploadAcademicsCSV);

// Route to upload student attendance by a teacher (requires authentication)
router.post('/:emp_id/upload-attendance',  teacherController.uploadAttendance);

// Route to update an academic record for a teacher (requires authentication)
router.put('/:emp_id', Auth.verifyToken, teacherController.updateAcademicRecord);

// Route to update student attendance by a teacher (requires authentication)
router.put('/attendance-update/:emp_id', Auth.verifyToken, teacherController.updateAttendance);

// Route to upload an assignment by a teacher
router.post('/:emp_id/assignment', teacherController.uploadAssignment);

// Route to update an assignment (requires authentication)
router.put('/:emp_id/update/assignment', Auth.verifyToken, teacherController.updateAssignment);

// Route to update a student's roll number (requires authentication)
router.put("/update-roll/:emp_id",  teacherController.updateStudentRollNo);

// Route to upload assignments via CSV file (requires authentication)
router.post("/upload/assignments", Auth.verifyToken, csvController.upload.single("file"), csvController.uploadAssignmentsCSV);

// Route to get subjects assigned to a teacher
router.get("/assignedSubjects/:emp_id", teacherController.getAssignedSubjectByTeacher );

// Route to get certificates issued to teachers
router.get("/certificates", teacherController.getCertificates);

router.get("/leaves", teacherController.getLeaveApplications);

router.post("/circular", upload.single("file"), teacherController.uploadCircular);




module.exports = router;

