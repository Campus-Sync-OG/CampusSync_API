const express = require('express');
const router = express.Router();
const academicController = require('../controllers/AcademicController');

// Route to create a new academic record
router.post('/', academicController.createAcademic);

// Route to get all academic records for a specific student
router.get('/:student_id', academicController.getStudentAcademics);

// Route to update an academic record by ID
router.put('/:academicId', academicController.updateAcademic);

// Route to delete an academic record by ID
router.delete('/:academicId', academicController.deleteAcademic);

module.exports = router;
