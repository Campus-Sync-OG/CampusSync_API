const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController');
const csvController=require('../controllers/CsvController');

router.post('/create', AssignmentController.createAssignment);
router.get('/all', AssignmentController.getAllAssignments);
router.get('/all/:admission_no', AssignmentController.getAssignmentsByAdmissionNo);
router.put('/update/:admission_no', AssignmentController.updateAssignment);
router.delete('/delete/:admission_no', AssignmentController.deleteAssignment);


router.post("/upload/assignments", csvController.upload.single("file"), csvController.uploadAssignmentsCSV);

module.exports = router;