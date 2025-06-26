const { attendance,student } = require('../models');

// Get all attendance records
exports.getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await attendance.findAll();
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ error: "Failed to retrieve attendance records" });
  }
};

// Get attendance record by ID
exports.getAttendanceByAdmissionNo
  = async (req, res) => {
  try {
    const { admission_no } = req.params;

    // Fetch all attendance records for the admission number
    const attendances = await attendance.findAll({
      where: { admission_no },
      order: [['date', 'ASC']], // Optional: sorts records by date
      attributes: ['date', 'status'], // Optional: return only necessary fields
    });

    if (!attendances || attendances.length === 0) {
      return res.status(404).json({ error: "No attendance records found" });
    }

    // Return the array of records
    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ error: "Failed to retrieve attendance records" });
  }
};

// Delete attendance record by ID
exports.deleteAttendanceById = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const deleted = await attendance.destroy({ where: { admission_no } });

    if (!deleted) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    res.status(500).json({ error: "Failed to delete attendance record" });
  }
};
// controllers/attendanceController.js

