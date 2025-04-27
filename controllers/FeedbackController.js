const { feedback } = require('../models');
exports.getAllFeedback = async (req, res) => {
    try {
      const feedbacks = await feedback.findAll({
        attributes: ["id","message"], // No sender info
      });
  
      res.status(200).json(feedbacks);
    } catch (error) {
      console.error("Error retrieving feedback:", error);
      res.status(500).json({ message: "Error retrieving feedback", error: error.message });
    }
  };