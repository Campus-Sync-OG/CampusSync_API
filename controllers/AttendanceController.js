const Attendance = require('../models/attendance'); // Ensure this matches your file structure
const Student = require('../models/student'); // Ensure this matches your file structure

// Create attendance record
const createAttendance = async (req, res) => {
  try {
    const { student_id, status, report_date, user_class_teacher_id } = req.body;

    // Check if student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if the teacher ID matches the student's teacher
    if (student.user_class_teacher_id !== user_class_teacher_id) {
      return res.status(403).json({ message: 'You are not authorized to mark attendance for this student' });
    }

    // Create the attendance record
    const attendance = await Attendance.create({
      student_id,
      status,
      report_date,
      user_class_teacher_id,
    });

    res.status(201).json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error creating attendance', error });
  }
};

// Get attendance for a specific student
const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Fetch attendance records for the student
    const attendanceRecords = await Attendance.findAll({
      where: { student_id },
      include: {
        model: Student,
        attributes: ['name', 'roll_no', 'class', 'section'],
      },
    });

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this student' });
    }

    res.status(200).json({ message: 'Attendance records retrieved successfully', attendanceRecords });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records', error });
  }
};

// Update attendance record
const updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    // Find the attendance record
    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update the status
    attendance.status = status;
    await attendance.save();

    res.status(200).json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error });
  }
};

// Delete attendance record
const deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    // Find and delete the attendance record
    const attendance = await Attendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await attendance.destroy();

    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attendance', error });
  }
};

module.exports = {
  createAttendance,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
};
