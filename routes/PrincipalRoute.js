const express = require('express');
const router = express.Router();
const principalController = require('../controllers/PrincipalController');
const Auth = require("../middleware/authMiddleware");

router.post('/create',  principalController.createPrincipal);
router.put('/update/:p_id', Auth.verifyToken, principalController.updatePrincipal);
router.delete('/delete/:p_id', Auth.verifyToken, principalController.softDeletePrincipal);
router.get('/all/:p_id', Auth.verifyToken, principalController.getPrincipalDetails);
router.get("/view",Auth.verifyToken, principalController.getAllFeedback);
router.get("/teacher-subject/all",principalController.getAllAssignedSubjectToTeacher);

router.get("/class-attendance",Auth.verifyToken, principalController.getAttendanceByClassSectionDate);
router.post("/attendance",Auth.verifyToken, principalController.getAttendanceByClassSectionDate);


module.exports = router;
