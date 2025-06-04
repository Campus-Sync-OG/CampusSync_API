const express = require('express');
const router = express.Router();
const studyModuleController = require('../controllers/StudyModuleController'); // corrected name
const multer = require('multer');

// Multer setup for memory storage (for Azure upload)
const storage = multer.memoryStorage(); // IMPORTANT: use memoryStorage for Azure
const upload = multer({ storage });

// Upload PDF + topic
router.post('/modules', upload.single('pdf'), studyModuleController.createModule);

// Dropdown routes
router.get('/modules/exams', studyModuleController.getExams);
router.get('/modules/subjects/:examName', studyModuleController.getSubjects);
router.get('/modules/topics/:examName/:subjectName', studyModuleController.getTopics);

// View PDF URL
router.get('/modules/view/:id', studyModuleController.viewPDF); // corrected path and name

// Download PDF (redirect)
router.get('/modules/download/:topicName', studyModuleController.downloadPDF); // corrected name

module.exports = router;
