const { principal, user, feedback, teacher_subject, student, attendance, sequelize } = require('../models');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Op } = require("sequelize");
const { uploadImageToAzure } = require('../services/AzureBlobService');
const sharp = require("sharp");
const teacherAssignments = {}; // Object to store assignments in-memory

// Set up multer for PDF uploads
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max size
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files (jpeg, png, webp) are allowed"));
    }
  },
}).single("attachment");



exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, joining_date ,designation,gender,school_name,address} = req.body;

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

    let imageUrl = null;
    if (req.file) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("jpeg")
        .toBuffer();

      imageUrl = await uploadImageToAzure(resizedImageBuffer, req.file.originalname, "teacher-profiles");
    }

    const newPrincipal = await principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      joining_date,
      designation: 'Principal',
      address: req.body.address || null,
      school_name: req.body.school_name || null,
      images: imageUrl || null ,// Store the image URL if uploaded
      gender
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
    const { p_id } = req.params;
    const updateFields = req.body;

    const principalRecord = await principal.findOne({ where: { p_id } });

    if (!principalRecord) {
      console.log("Principal not found for p_id:", p_id);
      return res.status(404).json({ message: "Principal not found" });
    }

    console.log("Existing Principal Data:", principalRecord.toJSON());

    let updatedFields = {}; // Track updated fields

    // Handle profile picture update
    if (req.file) {
      console.log("Profile picture upload detected");

      if (principalRecord.images) {
        await deleteImageFromAzure(principalRecord.images);
      }

      try {
        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize(200, 200)
          .toFormat("jpeg")
          .toBuffer();

        const imageUrl = await uploadImageToAzure(
          resizedImageBuffer,
          req.file.originalname,
          "principal-profiles"
        );

        updatedFields.images = imageUrl;
        console.log("Uploaded Image URL:", imageUrl);
      } catch (error) {
        console.error("Image Upload Failed:", error.message);
        return res.status(500).json({ message: "Image upload failed", error: error.message });
      }
    }

    // Allowed fields to update
    const allowedFields = [
      "name",
      "phone_no",
      "email",
      "address",
      "school_name",
      "designation",
      "gender",
      "joining_date"
    ];

    for (const field of allowedFields) {
      if (
        updateFields[field] !== undefined &&
        String(principalRecord[field]) !== String(updateFields[field])
      ) {
        updatedFields[field] = updateFields[field];
      }
    }

    console.log("Fields to Update:", updatedFields);

    if (Object.keys(updatedFields).length === 0) {
      console.log("No changes detected");
      return res.status(200).json({ message: "No changes detected" });
    }

    // Update principal record
    await principalRecord.update(updatedFields);

    // Fetch updated record
    const updatedPrincipal = await principal.findOne({ where: { p_id } });

    console.log("Principal updated successfully:", updatedPrincipal.toJSON());

    res.status(200).json({
      message: "Principal updated successfully",
      principal: updatedPrincipal,
    });
  } catch (error) {
    console.error("Error updating principal:", error.message);
    res.status(500).json({
      message: "Error updating principal",
      error: error.message,
    });
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
      attributes: ["id", "message"], // No sender info
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error retrieving feedback:", error);
    res.status(500).json({ message: "Error retrieving feedback", error: error.message });
  }
};


exports.getAllAssignedSubjectToTeacher = async (req, res) => {
  try {
    const assignments = await teacher_subject.findAll();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendanceByClassSectionDate = async (req, res) => {
  try {
    const { class: className, section, date } = req.query;
    const download = req.query.download === 'true';

    if (!date) {
      return res.status(400).json({
        message: 'Please provide at least className and date in the request body.'
      });
    }

    const studentWhere = { class: className };
    if (section) studentWhere.section = section;

    const students = await student.findAll({
      where: studentWhere,
      attributes: ['admission_no', 'student_name', 'section']
    });

    const admissionNos = students.map(s => s.admission_no);

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

    const result = students.map(student => {
      const status = attendanceMap[student.admission_no] || 'Not Marked';
      return {
        admission_no: student.admission_no,
        student_name: student.student_name,
        section: student.section,
        status
      };
    });

    const total = result.length;
    const present = result.filter(s => s.status === 'Present').length;
    const absent = result.filter(s => s.status === 'Absent').length;

    if (download) {
      // ✅ Ensure exports folder exists
      const exportDir = path.join(__dirname, '../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

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

      const filePath = path.join(exportDir, 'attendance_report.xlsx');
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, 'attendance_report.xlsx', err => {
        if (err) {
          console.error('Download error:', err);
          return res.status(500).json({ message: 'Failed to download file' });
        }
        fs.unlinkSync(filePath); // Clean up file
      });
    }

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


exports.getAttendancePercentage = async (req, res) => {
  try {
    const { class: className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({ message: "Class and Section are required." });
    }

    // Step 1: Get all unique attendance dates
    const totalDaysResult = await attendance.findAll({
      attributes: ["date"],
      where: { class: className, section },
      group: ["date"],
      raw: true
    });

    const totalDays = totalDaysResult.length;

    if (totalDays === 0) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    // Step 2: Get present count per student
    const attendanceCounts = await attendance.findAll({
      attributes: [
        "admission_no",
        [sequelize.fn("COUNT", sequelize.col("status")), "present_count"]
      ],
      where: {
        class: className,
        section,
        status: "Present"
      },
      group: ["admission_no"],
      raw: true
    });

    // Step 3: Get all students in the class/section
    const allStudents = await student.findAll({
      where: { class: className, section },
      attributes: ["admission_no", "student_name"],
      raw: true
    });

    // Step 4: Merge data and calculate percentages
    const data = allStudents.map(student => {
      const record = attendanceCounts.find(item => item.admission_no === student.admission_no);
      const presentCount = record ? parseInt(record.present_count) : 0;
      const percentage = ((presentCount / totalDays) * 100).toFixed(2);

      return {
        admission_no: student.admission_no,
        student_name: student.student_name,
        status: "Overall",
        percentage
      };
    });

    res.status(200).json({
      summary: {
        total_days: totalDays,
        students: data.length
      },
      data
    });
  } catch (error) {
    console.error("Error calculating attendance percentage:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


exports.updateAttendancePercentage = async (req, res) => {
  try {
    const { admission_no, percentage } = req.body;

    if (!admission_no || percentage === undefined) {
      return res.status(400).json({ message: 'Admission number and percentage are required.' });
    }

    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: 'Percentage must be between 0 and 100.' });
    }

    const record = await attendance.findOne({ where: { admission_no } });

    if (!record) {
      return res.status(404).json({ message: 'Student attendance record not found.' });
    }

    record.percentage = percentage;
    await record.save();

    res.status(200).json({ message: 'Percentage updated successfully.' });
  } catch (error) {
    console.error('Update percentage error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
