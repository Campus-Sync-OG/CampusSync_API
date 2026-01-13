// routes/hostel.js
const express = require('express');
const router = express.Router();
const { getHostelStudentsForWarden } = require('../controllers/HostelAttendanceController');
const Auth = require("../middleware/authMiddleware");


router.get('/warden/hostel-students', Auth.verifyToken, getHostelStudentsForWarden);

module.exports = router;
