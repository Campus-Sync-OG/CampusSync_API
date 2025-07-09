const express = require("express");
const router = express.Router();
const circularController = require("../controllers/CircularController");
const Auth = require("../middleware/authMiddleware");

// GET: Fetch circulars uploaded by the logged-in teacher
router.get("/my-circulars", Auth.verifyToken, circularController.getTeacherCirculars);

module.exports = router;
