const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');
const Auth = require("../middleware/authMiddleware");
const multer = require("multer");
const upload = multer();

router.post('/create',  upload.single('photo'),principalController.createPrincipal);
router.put('/update/:p_id', Auth.verifyToken, principalController.updatePrincipal);
router.delete('/delete/:p_id', Auth.verifyToken, principalController.softDeletePrincipal);
router.get('/all/:p_id', Auth.verifyToken, principalController.getPrincipalDetails);
router.get("/view",Auth.verifyToken, principalController.getAllFeedback);
router.get("/teacher-subject/all",principalController.getAllAssignedSubjectToTeacher);

router.get("/class-attendance",Auth.verifyToken, principalController.getAttendanceByClassSectionDate);
router.post("/attendance",Auth.verifyToken, principalController.getAttendanceByClassSectionDate);

router.get('/percentage', principalController.getAttendancePercentage);

router.put('/update-percentage', principalController.updateAttendancePercentage);

module.exports = router;
