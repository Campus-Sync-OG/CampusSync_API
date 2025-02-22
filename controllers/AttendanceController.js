const{attendance}=require('../models');

// Get all attendance records
const getAllAttendance = async (req, res) => {
  try {
    const attendanceRecords = await attendance.findAll();
    res.status(200).json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ error: "Failed to retrieve attendance records" });
  }
};

// Get attendance record by ID
const getAttendanceById = async (req, res) => {
  try {
    const {admission_no } = req.params;
    const attendances = await attendance.findOne({ where: { admission_no } });

    if (!attendances) {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    res.status(200).json(attendances);
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    res.status(500).json({ error: "Failed to retrieve attendance record" });
  }
};

// Delete attendance record by ID
const deleteAttendanceById = async (req, res) => {
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

module.exports = { getAllAttendance, getAttendanceById, deleteAttendanceById };
