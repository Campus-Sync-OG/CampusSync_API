const express = require("express");
const attendanceController = require("../controllers/AttendanceController");
const Auth = require("../middleware/authMiddleware");

const router = express.Router();

// Route to get all attendance records
router.get("/list", Auth.verifyToken, attendanceController.getAllAttendance);

// Route to get a specific attendance record by ID
router.get("/:admission_no", Auth.verifyToken, attendanceController. getAttendanceByAdmissionNo );

// Route to delete an attendance record by ID
router.delete("/delete/:admission_no", Auth.verifyToken, attendanceController.deleteAttendanceById);


router.get("/class-attendance",Auth.verifyToken, attendanceController.getClassAttendanceByDate);

module.exports = router;
