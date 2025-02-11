const express = require("express");
const router = express.Router();
const examFormatController = require("../controllers/ExamformatController");

// Define routes
router.post("/exam-format", examFormatController.createExamFormat);
router.get("/exam-format", examFormatController.getExamFormats);
router.get("/exam-format/:id", examFormatController.getExamFormatById);

module.exports = router;
