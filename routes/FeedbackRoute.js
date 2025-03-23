const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/FeedbackController");

// Route for students to submit feedback
router.post("/create", feedbackController.createFeedback);

// Route for teachers & principal to view feedback
router.get("/view", feedbackController.getAllFeedback);

module.exports = router;
