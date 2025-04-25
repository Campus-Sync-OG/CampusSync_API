const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Adjust path if necessary
const authControlller = require('../controllers/authController'); // Import functions from authController
const { uploadFeesCSV, upload } = require("../controllers/CsvController");
const RefreshToken = require("../middleware/refreshtoken");
const Auth = require("../middleware/authMiddleware");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

router.get('/list', Auth.verifyToken, userController.getAllUsers);

router.get('/:unique_id', Auth.verifyToken, userController.getUserByUniqueId);

router.post('/create', Auth.verifyToken, userController.createUser);

router.put('/update/:unique_id', Auth.verifyToken, userController.updateUser);

router.delete('/delete/:unique_id', Auth.verifyToken, userController.deleteUser);

router.post("/upload-fees", Auth.verifyToken, upload.single("file"), uploadFeesCSV);
router.post("/addfee", Auth.verifyToken, userController.addFee);




router.post('/upload', upload.single('file'), userController.uploadWithMetadata);

router.post("/create-user",Auth.verifyToken, authControlller.createUser);
router.post("/login", authControlller.login);
router.post("/reset-password", authControlller.resetPassword);


router.get('/certificates/:admission_no',userController.getStudentRequests);

// Admin
router.get('/certificates/all',userController.getAllRequests);
router.put('/certificates/update/:id', userController.updateCertificateStatus);

router.post("/add", authenticateUser, authorizeRole(["admin","operator"]), userController.createAnnouncement)

router.post("/postinfo", userController.createParent);

router.put("/:admission_no", userController.updateParent);

router.post('/subjects', Auth.verifyToken, userController.createSubjects);

router.put("/update/subjects/:id", userController.updateSubject);

router.post("/class-create", userController.createClassSection);

// Delete a class-section by ID
router.delete("/delete/:id", userController.deleteClassSection);

router.post("/timetable-create", userController.uploadTimetable);

// Route to assign subjects to a teacher
router.post('/assign-subjects', userController.assignSubjectToTeacher);

router.delete('/teacher-subject/:id', userController.deleteAssignedSubject);


router.get('/profile', (req, res) => {
  // Your existing logic for profile route
  res.send("User profile data here");
});


router.post('/Otp', authControlller.sendOTP);  // Use the sendOTP function from authController


router.post('/verify', authControlller.verifyOTP);
router.post("/token/refresh", RefreshToken.refreshToken);


module.exports = router;
