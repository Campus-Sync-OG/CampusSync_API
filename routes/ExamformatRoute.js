const express = require("express");
const router = express.Router();
const examFormatController = require("../controllers/ExamformatController");
const Auth = require("../middleware/authMiddleware");

// Define routes
router.post("/exam-format", Auth.verifyToken, examFormatController.createExamFormat);
router.get("/exam-format", Auth.verifyToken, examFormatController.getExamFormats);
router.get("/exam-format/:id", Auth.verifyToken, examFormatController.getExamFormatById);

module.exports = router;
