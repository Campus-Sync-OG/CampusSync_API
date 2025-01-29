const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController'); // Adjust path

router.post('/create', AssignmentController.createAssignment);
router.get('/all', AssignmentController.getAllAssignments);
router.get('/all/:id', AssignmentController.getAssignmentsByAdmissionNo);
router.put('/update/:id', AssignmentController.updateAssignment);
router.delete('/delete/:id', AssignmentController.deleteAssignment);

module.exports = router;