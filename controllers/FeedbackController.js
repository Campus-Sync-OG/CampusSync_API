const { feedback } = require("../models");

// Create Feedback (Anonymous Submission)
exports.createFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const newFeedback = await feedback.create({ message });

    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
};


// Get All Feedback (For Teachers & Principal)
exports.getAllFeedback = async (req, res) => {
    try {
      const feedbacks = await feedback.findAll({
        attributes: ["message"], // No sender info
      });
  
      res.status(200).json(feedbacks);
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
  };
  
