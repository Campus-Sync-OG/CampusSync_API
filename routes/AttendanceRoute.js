const express = require("express");
const attendanceController = require("../controllers/AttendanceController");

const router = express.Router();

// Route to get all attendance records
router.get("/list", attendanceController.getAllAttendance);

// Route to get a specific attendance record by ID
router.get("/:admission_no", attendanceController.getAttendanceById);

// Route to delete an attendance record by ID
router.delete("/delete/:admission_no", attendanceController.deleteAttendanceById);

module.exports = router;
