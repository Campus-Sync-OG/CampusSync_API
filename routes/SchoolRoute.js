const express = require('express');
const schoolInfoController = require('../controllers/SchoolinfoController');

const router = express.Router();

// Create a new school record


// Retrieve all school records
router.get('/all', schoolInfoController.getAll);

// Retrieve a single school record by ID
router.get('/schoolinfo/:id', schoolInfoController.getById);

// Delete a school record
router.delete('/delete/:id', schoolInfoController.delete);

module.exports = router;
