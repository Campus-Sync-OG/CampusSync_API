const express = require("express");
const router = express.Router();
const circularController = require("../controllers/CircularController");
const Auth = require("../middleware/authMiddleware");

// GET: Fetch circulars uploaded by the logged-in teacher
router.get("/my-circulars", Auth.verifyToken, circularController.getTeacherCirculars);

router.delete("/delete-circular/:id", Auth.verifyToken, circularController.deleteCircular);


module.exports = router;
