const express = require('express');
const router = express.Router();
const academicController = require('../controllers/AcademicController');

// Create a new academic record
router.post('/create', academicController.createAcademicRecord);

// Get all academic records
router.get('/list', academicController.getAllAcademicRecords);

// Get an academic record by admission_no
router.get('/:admission_no', academicController.getAcademicRecordByAdmissionNo);

// Update an academic record by admission_no
router.put('/update/:admission_no', academicController.updateAcademicRecord);

// Delete an academic record by admission_no
router.delete('/delete/:admission_no', academicController.deleteAcademicRecord);



module.exports = router;
