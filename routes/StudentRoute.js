const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const Auth = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer();


// Create a new student
router.post('/create', upload.single('images'), studentController.createStudent);

// Get all students
router.get('/list',  studentController.getAllStudents);

// Get a student by admission_no
router.get('/:admission_no', Auth.verifyToken, studentController.getStudentByAdmissionNo);

// Update a student by admission_no
router.put("/update/:admission_no", upload.single("image"), studentController.updateStudent)

// Delete a student by admission_no
router.delete('/delete/:admission_no', Auth.verifyToken, studentController.softDeleteStudent);

router.post("/upload-certificate", upload.single("certificate"), studentController.uploadCertificate);

router.delete("/certificates/:admission_no", studentController.deleteCertificate);

router.post('/request', studentController.requestCertificate);

router.post('/student-leave', Auth.verifyToken, studentController.submitLeaveApplication );

router.get('/circulars/:admission_no', studentController.getCircularByAdmissionNo);


//add feedback 
router.post("/add", Auth.verifyToken, studentController.createFeedback);

router.post("/assignment-upload/:admission_no", upload.single("file"), studentController.studentUploadAssignment);

 module.exports = router;
