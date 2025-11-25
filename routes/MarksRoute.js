// routes/marksRoutes.js
const express = require('express');
const router = express.Router();

// Controller
const { 
  submitMarks, 
  listPendingSubmissions, 
  reviewSubmission 
} = require('../controllers/MarksController');

// Your existing token middleware
const { verifyToken } = require('../middleware/authMiddleware'); 
// adjust path if your auth file is in /middlewares/ not /middleware/

// -------------------------------
// Teacher submits marks
// -------------------------------
router.post('/submit', verifyToken, submitMarks);

// -------------------------------
// Principal views pending submissions
// -------------------------------
router.get('/pending', verifyToken, listPendingSubmissions);

// -------------------------------
// Principal approves or rejects submission
// -------------------------------
router.put('/:id/review', verifyToken, reviewSubmission);

module.exports = router;
