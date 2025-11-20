const { principal, user, feedback, teacher_subject, student, attendance, sequelize } = require('../models');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Op } = require("sequelize");
const { uploadImageToAzure, deleteImageFromAzure } = require('../services/AzureBlobService');
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
    const { p_id, name, password, phone_no, email, joining_date, designation, gender, school_name, address } = req.body;

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
      images: imageUrl || null,// Store the image URL if uploaded
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
    const download = req.query.download === "true";

    if (!className || !date) {
      return res.status(400).json({
        message: "Please provide class and date.",
      });
    }

    const studentWhere = { class: className };
    if (section) studentWhere.section = section;

    const students = await student.findAll({
      where: studentWhere,
      attributes: ["admission_no", "student_name", "section"],
    });

    const admissionNos = students.map((s) => s.admission_no);

    const attendanceData = await attendance.findAll({
      where: {
        admission_no: admissionNos,
        date,
      },
      attributes: ["admission_no", "status", "period"],
    });

    // Define subjects for the class (you can make this dynamic)
    const subjects = ["Math", "Science", "English"];

    // Create a subject-wise attendance map per student
    const subjectStats = {};
    for (const subject of subjects) {
      subjectStats[subject] = {
        total: students.length,
        present: 0,
      };
    }

    // Track each student's subject-wise status
    const studentMap = {};
    for (const student of students) {
      studentMap[student.admission_no] = {
        ...student.dataValues,
        status: {},
      };
      for (const subject of subjects) {
        studentMap[student.admission_no].status[subject] = "Not Marked";
      }
    }

    for (const record of attendanceData) {
      const admission_no = record.admission_no;
      const isPresent = record.status === "Present";

      if (record.period === "Full Day") {
        // Count as present for all subjects
        for (const subject of subjects) {
          if (isPresent) subjectStats[subject].present += 1;
          studentMap[admission_no].status[subject] = record.status;
        }
      } else if (subjects.includes(record.period)) {
        if (isPresent) subjectStats[record.period].present += 1;
        studentMap[admission_no].status[record.period] = record.status;
      }
    }

    // Prepare final response per student
    const result = Object.values(studentMap);

    // Final subject-wise percentage (ensure ≤ 100)
    const subjectPercentages = subjects.map((subject) => {
      const { total, present } = subjectStats[subject];
      let percentage = total > 0 ? (present / total) * 100 : 0;
      percentage = Math.min(percentage, 100);
      return {
        subject,
        present,
        total,
        percentage: Number(percentage.toFixed(2)),
      };
    });

    if (download) {
      const exportDir = path.join(__dirname, "../exports");
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance");

      worksheet.columns = [
        { header: "Admission No", key: "admission_no", width: 15 },
        { header: "Student Name", key: "student_name", width: 25 },
        { header: "Section", key: "section", width: 10 },
        ...subjects.map((subject) => ({
          header: `${subject} Status`,
          key: subject,
          width: 15,
        })),
      ];

      result.forEach((student) => {
        const row = {
          admission_no: student.admission_no,
          student_name: student.student_name,
          section: student.section,
        };
        for (const subject of subjects) {
          row[subject] = student.status[subject];
        }
        worksheet.addRow(row);
      });

      worksheet.addRow([]);
      subjectPercentages.forEach((s) => {
        worksheet.addRow([
          `${s.subject} - Present: ${s.present}`,
          `Total: ${s.total}`,
          `Percentage: ${s.percentage}%`,
        ]);
      });

      const filePath = path.join(exportDir, "attendance_subjectwise_report.xlsx");
      await workbook.xlsx.writeFile(filePath);

      return res.download(filePath, "attendance_subjectwise_report.xlsx", (err) => {
        if (err) {
          console.error("Download error:", err);
          return res.status(500).json({ message: "Failed to download file" });
        }
        fs.unlinkSync(filePath); // Clean up
      });
    }

    return res.status(200).json({
      summary: subjectPercentages,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching subject-wise attendance:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    // Step 1: Fetch all attendance records of the student
    const records = await attendance.findAll({
      where: { admission_no },
      order: [['date', 'ASC']] // oldest first
    });

    const total_days = records.length;
    if (total_days === 0) {
      return res.status(404).json({ message: 'No attendance records found for this student.' });
    }

    const present_days = Math.round((percentage / 100) * total_days);

    // Step 2: Set all to "Absent" first
    await attendance.update(
      { status: 'Absent' },
      { where: { admission_no } }
    );

    // Step 3: Update the earliest N records to "Present"
    const present_ids = records.slice(0, present_days).map(r => r.id);

    await attendance.update(
      { status: 'Present' },
      { where: { id: present_ids } }
    );

    res.status(200).json({
      message: `Attendance updated to reflect ${percentage}%: ${present_days} Present out of ${total_days}.`
    });
  } catch (error) {
    console.error('Manual percentage update error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
