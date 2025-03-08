const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController');
const csvController = require('../controllers/CsvController');
const Auth = require("../middleware/authMiddleware");

router.post('/create', Auth.verifyToken, AssignmentController.createAssignment);
router.get('/all', Auth.verifyToken, AssignmentController.getAllAssignments);
router.get('/all/:admission_no', Auth.verifyToken, AssignmentController.getAssignmentsByAdmissionNo);
router.put('/update/:admission_no', Auth.verifyToken, AssignmentController.updateAssignment);
router.delete('/delete/:admission_no', Auth.verifyToken, AssignmentController.deleteAssignment);


router.post("/upload/assignments", Auth.verifyToken, csvController.upload.single("file"), csvController.uploadAssignmentsCSV);

module.exports = router;