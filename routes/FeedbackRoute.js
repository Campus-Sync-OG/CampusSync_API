const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const Auth = require("../middleware/authMiddleware");


router.get("/view",Auth.verifyToken, feedbackController.getAllFeedback);
module.exports = router;