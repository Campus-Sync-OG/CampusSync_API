const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController'); // Adjust path

router.post('/create', AssignmentController.createAssignment);
router.get('/all', AssignmentController.getAllAssignments);
router.get('/all/:admission_no', AssignmentController.getAssignmentsByAdmissionNo);
router.put('/update/:admission_no', AssignmentController.updateAssignment);
router.delete('/delete/:admission_no', AssignmentController.deleteAssignment);

module.exports = router;