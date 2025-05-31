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
exports.getClassAttendanceByDate = async (req, res) => {
  try {
    const { class: className, section, date } = req.body;

    if (!className || !section || !date) {
      return res.status(400).json({ error: "Missing class, section, or date in query" });
    }

   // Fetch students for class + section
    const students = await student.findAll({
      where: {
        class: Number(className), // Ensure type match
        section: section,
      },
      attributes: ["admission_no", "student_name"],
    });

    if (!students || students.length === 0) {
      console.log("⚠️ No students found for class and section.");
      return res.status(404).json({ error: "No students found for the given class and section" });
    }

    const admissionNos = students.map((s) => s.admission_no);
    console.log("✅ Found students with admission_nos:", admissionNos);

    // Fetch attendance for those students on the given date
    const attendanceEntries = await attendance.findAll({
      where: {
        admission_no: admissionNos,
        date: date, // Make sure it's in YYYY-MM-DD format
      },
      attributes: ["admission_no", "status", "period"],
      order: [["admission_no", "ASC"]],
    });

    if (!attendanceEntries || attendanceEntries.length === 0) {
      console.log(" No attendance records found for the given admission numbers and date.");
      return res.status(404).json({ error: "No attendance records found" });
    }

    console.log(`📋 Attendance records found: ${attendanceEntries.length}`);

    // Create a map of admission_no -> student_name
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s.admission_no] = s.student_name;
    });

    // Prepare result
    const result = attendanceEntries.map((entry) => ({
      student_id: entry.admission_no,
      student_name: studentMap[entry.admission_no] || "Unknown",
      status: entry.status,
      period: entry.period ?? "N/A",
    }));

    return res.status(200).json({
      metadata: {
        class: className,
        section,
        date,
        total_students: students.length,
        total_records: result.length,
        report_generated_at: new Date().toLocaleString("en-IN"),
      },
      attendance: result,
    });

  } catch (error) {
    console.error("❗ Error in getClassAttendanceByDate:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
