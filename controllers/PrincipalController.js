const { principal, user ,feedback,teacher_subject,student,attendance} = require('../models');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, joining_date } = req.body;

    if (!p_id || !name || !password || !joining_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if a principal already exists in the system
    const existingPrincipal = await principal.findOne();
    if (existingPrincipal) {
      return res.status(400).json({ message: 'A principal already exists. Please remove the existing principal before adding a new one.' });
    }

    // Check if user exists with this ID and role
    const matchingUser = await user.findOne({ where: { unique_id: p_id, role: 'principal' } });
    if (!matchingUser) {
      return res.status(400).json({ message: 'No user found with this unique_id and role principal' });
    }

    const newPrincipal = await principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      joining_date,
    });

    res.status(201).json({ message: 'Principal created successfully', principal: newPrincipal });
  } catch (error) {
    console.error('Error creating principal:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};


// Function to update the details of a principal
exports.updatePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params; // Principal ID from the URL
    const updates = req.body; // Updates from the request body

    // Find the principal using p_id
    const existingPrincipal = await principal.findOne({ where: { p_id } });
    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Update the principal's details
    await existingPrincipal.update(updates);

    res.status(200).json({ message: 'Principal updated successfully', principal: existingPrincipal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to delete a principal
exports.softDeletePrincipal = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Find the principal by p_id
    const existingPrincipal = await principal.findOne({ where: { p_id } });

    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    // Soft delete the principal (if you mean marking as inactive)
    await existingPrincipal.update({ is_active: false });

    res.status(200).json({ message: 'Principal soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to fetch the principal details
exports.getPrincipalDetails = async (req, res) => {
  try {
    const { p_id } = req.params;

    // Fetch details from the principal table
    const existingPrincipal = await principal.findOne({ where: { p_id } });
    if (!existingPrincipal) {
      return res.status(404).json({ message: 'Principal not found in Principal table' });
    }

    res.status(200).json(existingPrincipal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const findPrincipalById = async (p_id, res) => {
  const foundPrincipal = await principal.findOne({ where: { p_id } });
  if (!foundPrincipal) {
    res.status(404).json({ message: "Principal not found" });
    return null;
  }
  return foundPrincipal;
};

exports.getAllFeedback = async (req, res) => {
  console.log("Fetching all feedbacks...");
  try {
    const feedbacks = await feedback.findAll({
      attributes: ["id","message"], // No sender info
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ message: "Error retrieving feedback", error: error.message });
  }
};


exports.getAllAssignedSubjectToTeacher= async (req, res) => {
  try {
    const assignments = await teacher_subject.findAll();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAttendanceByClassSectionDate = async (req, res) => {
  try {
    const { class: className, section, date } = req.body;
    const download = req.query.download === 'true';

    if (!className || !date) {
      return res.status(400).json({
        message: 'Please provide at least className and date in the request body.'
      });
    }

    // Fetch all students in class/section
    const studentWhere = { class:className };
    if (section) studentWhere.section = section;

    const students = await student.findAll({
      where: studentWhere,
      attributes: ['admission_no', 'student_name', 'section']
    });

    const admissionNos = students.map(s => s.admission_no);

    // Get attendance for those students on that date
    const attendanceData = await attendance.findAll({
      where: {
        admission_no: admissionNos,
        date
      },
      attributes: ['admission_no', 'status']
    });

    const attendanceMap = {};
    attendanceData.forEach(record => {
      attendanceMap[record.admission_no] = record.status;
    });

    // Merge student data with attendance
    const result = students.map(student => {
      const status = attendanceMap[student.admission_no] || 'Not Marked';
      return {
        admission_no: student.admission_no,
        student_name: student.student_name,
        section: student.section,
        status
      };
    });

    // Count stats
    const total = result.length;
    const present = result.filter(s => s.status === 'Present').length;
    const absent = result.filter(s => s.status === 'Absent').length;

    // Excel Download (optional)
    if (download) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance');

      worksheet.columns = [
        { header: 'Admission No', key: 'admission_no', width: 15 },
        { header: 'Student Name', key: 'student_name', width: 25 },
        { header: 'Section', key: 'section', width: 10 },
        { header: 'Status', key: 'status', width: 10 }
      ];

      worksheet.addRows(result);
      worksheet.addRow([]);
      worksheet.addRow(['Total Students', total]);
      worksheet.addRow(['Present', present]);
      worksheet.addRow(['Absent', absent]);

      const filePath = path.join(__dirname, '../exports/attendance_report.xlsx');
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, 'attendance_report.xlsx', err => {
        if (err) console.error('Download error:', err);
        fs.unlinkSync(filePath); // Clean up file after download
      });
    }

    // Regular JSON response
    return res.status(200).json({
      summary: {
        total_students: total,
        present,
        absent
      },
      data: result
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};