const express = require('express');
const router = express.Router();
const academicsController = require('../controllers/academicsController');

router.post('/create', academicsController.createAcademicRecord); // Create an academic record
router.get('/all', academicsController.getAllAcademicRecords); // Get all academic records
router.get('/:id', academicsController.getAcademicRecordById); // Get an academic record by ID
router.put('/:id', academicsController.updateAcademicRecord); // Update an academic record
router.delete('/:id', academicsController.deleteAcademicRecord); // Delete an academic record

module.exports = router;
