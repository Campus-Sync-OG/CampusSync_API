const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/PromotionController'); // adjust the path if needed

// POST /promotion - Promote a batch of students
router.post('/promote', promotionController.promoteStudents);

module.exports = router;
