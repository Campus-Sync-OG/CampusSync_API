const { teacher, student, academics, examformat, user, attendance, assignment, subject, achievement, leaveapplication, circular, teacher_subject, teacher_class_sections } = require('../models');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
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




/* Helper Functions */
const findTeacherById = async (emp_id, res) => {
  const foundTeacher = await teacher.findOne({ where: { emp_id } });
  if (!foundTeacher) {
    res.status(404).json({ message: "Teacher not found" });
    return null;
  }
  return foundTeacher;
};

const findStudentByAdmissionNo = async (admission_no, res) => {
  const foundStudent = await student.findOne({ where: { admission_no } });
  if (!foundStudent) {
    res.status(404).json({ message: "Student not found" });
    return null;
  }
  return foundStudent;
};

/* Controllers */

// Create a new teacher
exports.createTeacher = async (req, res) => {
  try {
    const {
      emp_id,
      emp_name,
      email,
      blood_gp,
      religion,
      address,
      dob,
      phone_no,
      joining_date,
      role,
      status,
      gender,
      salary_structure_id // ✅ new field
    } = req.body;

    if (!emp_id || !emp_name) {
      return res.status(400).json({ message: 'emp_id, emp_name are required' });
    }

    // Validate emp_id against User model
    const matchingUser = await user.findOne({ where: { unique_id: emp_id, role: 'teacher' } });
    if (!matchingUser) {
      return res.status(400).json({ error: 'No matching user found with role teacher' });
    }
    if (matchingUser.unique_id !== emp_id) {
      return res.status(400).json({ error: 'Employee ID does not match the unique ID in the User model' });
    }

    let imageUrl = null;
    if (req.file) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("jpeg")
        .toBuffer();

      imageUrl = await uploadImageToAzure(resizedImageBuffer, req.file.originalname, "teacher-profiles");
    }

    const newTeacher = await teacher.create({
      emp_id,
      emp_name,
      email,
      blood_gp,
      dob,
      religion,
      phone_no,
      joining_date,
      role,
      status,
      address,
      gender,
      salary_structure_id, // ✅ added to model creation
      images: imageUrl
    });

    return res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return res.status(500).json({ message: error.message });
  }
};


exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacher.findAll({
      order: [['emp_name', 'ASC']] // Sort by teacher_name in ascending order
    });

    if (!teachers.length) {
      return res.status(404).json({ message: 'No teachers found' });
    }

    return res.status(200).json({ teachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({ message: error.message });
  }
};


exports.getTeacherById = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    return res.status(200).json({ teacher: foundTeacher });
  } catch (error) {
    console.error("Error fetching teacher by id:", error);
    return res.status(500).json({ message: error.message });
  }
};



exports.updateTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const {
      emp_name,
      email,
      subjects,
      password,
      phone_no,
      joining_date,
      status,
      role,               // ⬅️ Added
      class_name,         // ⬅️ Added
      section_name        // ⬅️ Added
    } = req.body;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // ✅ Update fields if provided
    foundTeacher.emp_name = emp_name || foundTeacher.emp_name;
    foundTeacher.email = email || foundTeacher.email;
    foundTeacher.subjects = subjects || foundTeacher.subjects;
    foundTeacher.status = status || foundTeacher.status;
    foundTeacher.phone_no = phone_no || foundTeacher.phone_no;
    foundTeacher.joining_date = joining_date || foundTeacher.joining_date;

    if (password) {
      foundTeacher.password = await bcrypt.hash(password, 10);
    }

    await foundTeacher.save();

    // ✅ If teacher is assigned role "Class Teacher" then add/update teacher_class_sections
    if (role === "Class Teacher" && class_name && section_name) {
      // Check if entry exists already
      const existingRecord = await teacher_class_sections.findOne({
        where: { emp_id, class_name, section_name }
      });

      if (!existingRecord) {
        await teacher_class_sections.create({
          emp_id,
          role,
          class_name,
          section_name
        });
      } else {
        // Optional: update role if it changed
        existingRecord.role = role;
        await existingRecord.save();
      }
    }

    return res.status(200).json({
      message: 'Teacher updated successfully',
      teacher: foundTeacher
    });

  } catch (error) {
    console.error("Error updating teacher:", error);
    return res.status(500).json({ message: error.message });
  }
};


// Soft delete a teacher (mark as inactive)
exports.softDeleteTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await foundTeacher.update({ is_active: false });
    return res.status(200).json({ message: 'Teacher soft-deleted successfully' });
  } catch (error) {
    console.error("Error soft-deleting teacher:", error);
    return res.status(500).json({ message: error.message });
  }
};


// controllers/academicsController.js
exports.addStudentMarks = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const {
      class_grade,
      section,
      exam_format,
      academic_year,
      exam_date,
      marks,
    } = req.body;

    if (
      !class_grade ||
      !section ||
      !exam_format ||
      !academic_year ||
      !exam_date ||
      !Array.isArray(marks)
    ) {
      return res.status(400).json({
        message: "All fields are required including marks array",
      });
    }

    // 1. Check teacher existence
    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2. Check exam format validity
    const validExamFormat = await examformat.findOne({
      where: { exam_name: exam_format },
    });
    if (!validExamFormat) {
      return res
        .status(400)
        .json({ message: `Invalid exam format: ${exam_format}` });
    }

    // 3. Process each mark entry
    const responses = [];

    for (const entry of marks) {
      const { admission_no, subjects, marks_obtained, total_marks } = entry;

      // Basic validation
      if (!admission_no || !subjects || !marks_obtained || !total_marks) {
        responses.push({
          admission_no,
          status: "failed",
          message: "Missing fields",
        });
        continue;
      }

      // Check if student exists in given class and section
      const studentExists = await student.findOne({
        where: {
          admission_no,
          class: class_grade,
          section,
        },
      });

      if (!studentExists) {
        responses.push({
          admission_no,
          status: "failed",
          message: "Student not found in class/section",
        });
        continue;
      }
      // ✅ Directly save academic mark entry (no subject/teacher-subject checks)
      const record = await academics.create({
        admission_no,
        emp_id,
        subjects,
        class_grade,
        section,
        exam_format,
        academic_year,
        marks_obtained,
        total_marks,
        exam_date,
      });
      console.log("Academic record created:", record);
      responses.push({ admission_no, status: "success", record });
    }
    console.log("Bulk upload responses:", responses);
    return res.status(207).json({
      message: "Bulk upload processed",
      results: responses,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateAcademicRecord = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { admission_no, subjects, exam_format, class_grade, marks_obtained, total_marks, academic_year, exam_date } = req.body;

    if (!admission_no || !subjects || !exam_format) {
      return res.status(400).json({ message: "Admission no, subject, and exam format are required." });
    }

    const foundTeacher = await findTeacherById(emp_id, res);
    if (!foundTeacher) return;

    const foundStudent = await findStudentByAdmissionNo(admission_no, res);
    if (!foundStudent) return;

    const academicRecord = await academics.findOne({
      where: { admission_no, subjects, exam_format },
    });
    if (!academicRecord) {
      return res.status(404).json({ message: "Academic record not found." });
    }

    await academicRecord.update({
      marks_obtained: marks_obtained !== undefined ? marks_obtained : academicRecord.marks_obtained,
      total_marks: total_marks !== undefined ? total_marks : academicRecord.total_marks,
      academic_year: academic_year || academicRecord.academic_year,
      exam_date: exam_date || academicRecord.exam_date,
      class_grade: class_grade || academicRecord.class_grade,
    });

    return res.status(200).json({ message: "Academic record updated successfully.", data: academicRecord });
  } catch (error) {
    console.error("Error updating academic record:", error);
    return res.status(500).json({ message: "An error occurred while updating the record." });
  }
};

exports.uploadAttendance = async (req, res) => {
  try {
    const { date, attendance_type, records } = req.body;

    // Validate attendance_type
    if (!["day-wise", "period-wise"].includes(attendance_type)) {
      return res.status(400).json({ message: "Invalid attendance type" });
    }

    // Validate records
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Invalid records data" });
    }

    // Prepare attendance data
    const attendanceData = records.map(record => ({
      admission_no: record.admission_no,
      date: date || new Date().toISOString().split('T')[0],
      status: record.status,
      period: attendance_type === "period-wise" ? (record.period || "Full Day") : "Full Day",
      attendance_type,
      class: record.class,
      section: record.section
    }));

    // Remove existing records to avoid duplicates
    for (const data of attendanceData) {
      await attendance.destroy({
        where: {
          admission_no: data.admission_no,
          date: data.date,
          period: data.period,
          attendance_type: data.attendance_type
        }
      });
    }

    // Bulk insert new attendance
    await attendance.bulkCreate(attendanceData);

    return res.status(201).json({ message: "Attendance uploaded successfully" });

  } catch (error) {
    console.error("Error uploading attendance:", error.message || error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




exports.updateAttendance = async (req, res) => {
  try {
    const { admission_no, emp_id, date, status } = req.body;
    if (!admission_no || !emp_id || !date || !status) {
      return res.status(400).json({ message: "admission_no, emp_id, date, and status are required." });
    }

    const foundTeacher = await findTeacherById(emp_id, res);
    if (!foundTeacher) return;

    const foundStudent = await findStudentByAdmissionNo(admission_no, res);
    if (!foundStudent) return;

    const attendanceRecord = await attendance.findOne({ where: { admission_no, date } });
    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    await attendanceRecord.update({ status });
    return res.status(200).json({ message: "Attendance updated successfully.", data: attendanceRecord });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return res.status(500).json({ message: "An error occurred while updating the attendance record." });
  }
};


exports.uploadAssignment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { subjects, title, Date: assignmentDate, class_name, section } = req.body;
      const { emp_id } = req.params;


      if (!subjects || !title || !class_name || !section || !emp_id || !assignmentDate || !req.file) {
        return res.status(400).json({
          message: "subjects, title, Date, class_name, section, emp_id, and attachment are required",
        });
      }

      // Find teacher
      const foundTeacher = await findTeacherById(emp_id, res);
      if (!foundTeacher) return;

      // Find subject validity
      const validSubject = await subject.findOne({ where: { subject_name: subjects } });
      if (!validSubject) {
        return res.status(400).json({ message: `Invalid subject name: ${subjects}` });
      }

      // Upload PDF to Azure Blob Storage
      const fileBuffer = req.file.buffer;
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const azureUrl = await uploadImageToAzure(fileBuffer, fileName);

      // Find all students in the class & section
      const students = await student.findAll({
        where: { "class": class_name, section }
      });

      if (!students.length) {
        return res.status(404).json({ message: "No students found in this class & section" });
      }

      // Store assignment for each student
      const assignments = [];

      for (const studentItem of students) {
        const newAssignment = await assignment.create({
          subjects,
          title,
          attachment: azureUrl,
          admission_no: studentItem.admission_no,
          emp_id,
          Date: assignmentDate,
          emp_name: foundTeacher.emp_name,
          class_name,
          section,
        });
        assignments.push(newAssignment);
      }

      return res.status(201).json({
        message: "Assignment uploaded successfully to all students in class",
        assignments,
      });

    } catch (error) {
      console.error("Error uploading assignment:", error.message, error.stack);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
};


exports.updateAssignment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { emp_id } = req.params;
      const { subjects, title, Date: assignmentDate, admission_no } = req.body;
      if (!subjects || !title || !assignmentDate || !admission_no) {
        return res.status(400).json({
          message: "subject, title, Date, and admission_no are required",
        });
      }

      const foundTeacher = await findTeacherById(emp_id, res);
      if (!foundTeacher) return;
      const emp_name = foundTeacher.emp_name;

      const foundAssignment = await assignment.findOne({ where: { emp_id, admission_no } });
      if (!foundAssignment) {
        return res.status(404).json({ message: "Assignment not found for this teacher" });
      }

      // If admission_no changed (rare scenario), validate new student exists
      if (foundAssignment.admission_no !== admission_no) {
        const foundStudent = await findStudentByAdmissionNo(admission_no, res);
        if (!foundStudent) return;
      }

      const updateData = {
        subjects,
        title,
        Date: assignmentDate,
        admission_no,
        emp_id,
        emp_name,
        ...(req.file && { attachment: req.file.path }),
      };

      await assignment.update(updateData, { where: { emp_id, admission_no } });
      const updatedAssignment = await assignment.findOne({ where: { emp_id, admission_no } });
      return res.status(200).json({
        message: "Assignment updated successfully",
        assignment: updatedAssignment,
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

exports.updateStudentRollNo = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { admission_no, new_roll_no, className, section } = req.query;

    if (!admission_no || !new_roll_no || !className || !section) {
      return res.status(400).json({ message: "Admission number, class, section, and new roll number are required." });
    }

    // Check if teacher exists and has the role of 'class teacher'
    const foundTeacher = await teacher.findOne({ where: { emp_id, role: 'classTeacher' } });
    if (!foundTeacher) {
      return res.status(403).json({ message: "Only class teachers can update roll numbers." });
    }

    // Find the student with matching admission_no, class, and section
    const foundStudent = await student.findOne({
      where: {
        admission_no,
        class: className,
        section: section
      }
    });

    if (!foundStudent) {
      return res.status(404).json({ message: "Student not found for the given class and section." });
    }

    // Update the roll number
    foundStudent.roll_no = new_roll_no;
    await foundStudent.save();

    return res.status(200).json({
      message: "Roll number updated successfully.",
      student: {
        admission_no,
        class: className,
        section,
        new_roll_no
      },
    });
  } catch (error) {
    console.error("Error updating roll number:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getAssignedSubjectByTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const assignments = await teacher_subject.findAll({
      where: { emp_id } // assuming 'emp_id' is the correct column
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCertificates = async (req, res) => {
  try {
    const emp_id = req.params.emp_id;

    if (!emp_id) {
      return res.status(403).json({ message: "Unauthorized: Teacher ID missing" });
    }

    // Step 1: Get teacher's assigned class-section pairs
    const assignedSections = await teacher_class_sections.findAll({
      where: { emp_id },
      attributes: ['class_name', 'section_name']
    });

    if (!assignedSections.length) {
      return res.status(404).json({ message: "No assigned class-sections found for this teacher" });
    }

    // Step 2: Match with student table columns
    const assignedPairs = assignedSections.map(s => ({
      class: s.class_name,
      section: s.section_name
    }));

    // Step 3: Get students in those class-sections
    const students = await student.findAll({
      where: {
        [Op.or]: assignedPairs
      },
      attributes: ['admission_no', 'student_name', 'class', 'section']
    });

    if (!students.length) {
      return res.status(404).json({ message: "No students found for assigned classes" });
    }

    const studentMap = {};
    const admissionNos = students.map(std => {
      studentMap[std.admission_no] = std;
      return std.admission_no;
    });

    // Step 4: Fetch certificates for those students
    const certificates = await achievement.findAll({
      where: {
        admission_no: admissionNos
      }
    });

    if (!certificates.length) {
      return res.status(404).json({ message: "No certificates found for assigned students" });
    }

    // Step 5: Format response with student name
    const formatted = certificates.map(cert => ({
      ...cert.toJSON(),
      student_name: studentMap[cert.admission_no]?.student_name || null,
      class: studentMap[cert.admission_no]?.class || null,
      section: studentMap[cert.admission_no]?.section || null
    }));

    res.status(200).json({
      message: "Certificates retrieved successfully",
      certificates: formatted
    });

  } catch (error) {
    console.error("Error fetching certificates:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// Get all leave applications
exports.getLeaveApplications = async (req, res) => {
  try {
    const { emp_id } = req.params;  // Get emp_id from params

    if (!emp_id) {
      return res.status(400).json({ message: "Missing emp_id" });
    }

    // 1️⃣ Fetch leave applications where emp_id matches
    const leaves = await leaveapplication.findAll({
      where: {
        emp_id
      }
    });

    if (leaves.length === 0) {
      return res.status(404).json({
        message: "No leave applications found for this teacher"
      });
    }

    res.status(200).json({
      message: "Leave applications fetched successfully",
      leaves
    });

  } catch (error) {
    console.error("Error fetching teacher leaves:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.uploadCircular = async (req, res) => {
  try {
    const { title, description, date, class_name, section } = req.body;
    const file = req.file;
    const emp_id = req.user?.unique_id; // ⬅️ Take emp_id directly from token

    // 🔍 Validation
    if (!title || !description || !date || !class_name || !section) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!emp_id) {
      return res.status(401).json({ error: "Unauthorized: emp_id missing in token" });
    }

    // ☁️ Upload file to Azure
    const fileName = `${Date.now()}-${file.originalname}`;
    const blobUrl = await uploadImageToAzure(file.buffer, fileName);

    if (!blobUrl) {
      return res.status(500).json({ error: "File upload failed" });
    }

    // 🎯 Get students of target class and section
    const students = await student.findAll({
      where: { class: class_name, section },
    });

    const admissionNos = students.map((s) => s.admission_no);

    // 📩 Create a circular per student
    const circulars = [];
    for (const admission_no of admissionNos) {
      const newCircular = await circular.create({
        date,
        headline: title,
        note: description,
        attachment_url: blobUrl,
        class_name,
        section,
        admission_no,
        emp_id: emp_id, // ⬅️ Directly from token
      });
      circulars.push(newCircular);
    }

    return res.status(201).json({
      message: "Circulars uploaded successfully",
      circulars,
    });

  } catch (error) {
    console.error("Upload Circular Error:", error);
    return res.status(500).json({
      error: "Failed to upload circular",
      details: error.message,
    });
  }
};

exports.upload = upload;