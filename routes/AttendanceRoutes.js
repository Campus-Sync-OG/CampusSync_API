const express = require('express');
const  AttendanceController= require('../controllers/AttendanceController');

const router = express.Router();

// Create attendance
router.post('/create', AttendanceController.createAttendance);

// Get attendance for a student
router.get('/:studentId', AttendanceController.getStudentAttendance);

// Update attendance
router.put('/:attendanceId', AttendanceController.updateAttendance);

// Delete attendance
router.delete('/:attendanceId', AttendanceController.deleteAttendance);

module.exports = router;
