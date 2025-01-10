const express = require('express');
const router = express.Router();
const academicsController = require('../controllers/academicsController'); // Adjust the path if needed

// Route to create a new academic record
router.post('/create', academicsController.createAcademicRecord);

// Route to get all academic records
router.get('/get', academicsController.getAllAcademicRecords);

// Route to get a single academic record by ID
router.get('/:id', academicsController.getAcademicRecordById);

// Route to update an academic record by ID
router.put('/update/:id', academicsController.updateAcademicRecord);

// Route to delete an academic record by ID
router.delete('/delete/:id', academicsController.deleteAcademicRecord);

module.exports = router;
