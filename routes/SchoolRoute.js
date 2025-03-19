const express = require('express');
const router = express.Router();
const schoolInfoController = require('../controllers/SchoolinfoController');

// Create a new school record
router.post('/create', schoolInfoController.createSchool);

// Get all school records
router.get('/list', schoolInfoController.getAllSchools);

// Get a specific school record by ID
router.get('/list/:id', schoolInfoController.getSchoolById);

// Update a school record
router.put('/update/:id', schoolInfoController.updateSchool);

module.exports = router;
