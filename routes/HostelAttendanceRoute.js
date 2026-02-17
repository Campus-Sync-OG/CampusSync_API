// routes/hostel.js
const express = require('express');
const router = express.Router();
const { getHostelStudentsForWarden,saveHostelAttendance } = require('../controllers/HostelAttendanceController');
const Auth = require("../middleware/authMiddleware");


router.get('/warden/hostel-students', Auth.verifyToken, getHostelStudentsForWarden);
router.post(
  "/hostel/attendance/save",
  Auth.verifyToken,
  saveHostelAttendance
);

module.exports = router;
