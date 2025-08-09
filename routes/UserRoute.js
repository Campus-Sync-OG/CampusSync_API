const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Adjust path if necessary
const authControlller = require('../controllers/authController'); // Import functions from authController
const { uploadFeesCSV, upload } = require("../controllers/CsvController");
const RefreshToken = require("../middleware/refreshtoken");
const Auth = require("../middleware/authMiddleware");
const {  authorizeRole } = require("../middleware/authMiddleware");


// User routes
 router.get('/list', Auth.verifyToken, userController.getAllUsers);
router.get('/:unique_id', Auth.verifyToken, userController.getUserByUniqueId);
// router.post('/create', Auth.verifyToken, userController.createUser);
router.put('/update/:unique_id', Auth.verifyToken, userController.updateUser);
// router.delete('/delete/:unique_id', Auth.verifyToken, userController.deleteUser);

// CSV upload routes
router.post("/upload-fees", Auth.verifyToken, upload.single("file"), uploadFeesCSV);
router.post("/addfee", Auth.verifyToken, userController.addFee);
router.post('/upload', upload.single('file'), userController.uploadWithMetadata);

// Auth routes
router.post("/create-user", Auth.verifyToken, authControlller.createUser);
router.post("/login", authControlller.login);
router.post("/reset-password", authControlller.resetPassword);

// Certificates
router.get('/certificates/:admission_no', userController.getStudentRequests);
router.get('/get/all', userController.getAllRequests);
router.put('/certificates/update/:id', userController.updateCertificateStatus);

// Announcement
router.post("/add", Auth.verifyToken, authorizeRole(["admin", "operator","principal"]), userController.createAnnouncement);

// Parent info
router.post("/postinfo", userController.createParent);
router.put("/:admission_no", userController.updateParent);

// Subjects and class-section
router.post('/subjects', Auth.verifyToken, userController.createSubjects);
router.put("/update/subjects/:id", userController.updateSubject);
router.post("/class-create", userController.createClassSection);
router.delete("/delete/:id", userController.deleteClassSection);

// Timetable
router.post("/timetable-create", userController.uploadTimetable);

// Subject assignment
router.post('/assign-subjects', Auth.verifyToken, userController.assignSubjectToTeacher);
router.delete('/teacher-subject/:id', userController.deleteAssignedSubject);
router.get('/list/teacher-subject', userController.getAssignedSubjects);

// Profile (test)
router.get('/profile', (req, res) => {
  res.send("User profile data here");
});

// OTP
router.post('/Otp', authControlller.sendOTP);
router.post('/verify', authControlller.verifyOTP);

// Token refresh
router.post("/token/refresh", RefreshToken.refreshToken);


module.exports = router;
