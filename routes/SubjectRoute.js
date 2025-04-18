const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/SubjectController'); // Adjust the path to your controller file

// Get all subjects
router.get('/all', subjectController.getAllSubjects);

// Get single subject by ID
router.get('/subjects/:id', subjectController.getSubjectById);

// Delete a subject by ID
router.delete('/subjects/:id', subjectController.deleteSubject);

module.exports = router;