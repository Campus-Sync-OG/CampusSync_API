const express = require('express');
const router = express.Router();
const studentProfileController = require('./controllers/studentProfileController');

// Route to get all student profiles
router.get('/profiles', studentProfileController.getAllProfiles);

// Route to get a single student profile by ID
router.get('/profiles/:id', studentProfileController.getProfileById);

// Route to create a new student profile
router.post('/profiles', studentProfileController.createProfile);

// Route to update an existing student profile by ID
router.put('/profiles/:id', studentProfileController.updateProfile);

// Route to delete a student profile by ID
router.delete('/profiles/:id', studentProfileController.deleteProfile);

module.exports = router;