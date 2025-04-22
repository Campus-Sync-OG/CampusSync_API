const { teacher, student, academics, examformat, user, attendance, assignment, subject, achievement,leaveapplication } = require('../models');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { uploadImageToAzure } = require('../services/AzureBlobService');

// Set up multer for PDF uploads
const storage = multer.memoryStorage(); // Use memory storage to access buffer

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
}).single('attachment');


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
    const { emp_id, emp_name, email, subjects, password, phone_no, joining_date, is_active, role, status } = req.body;

    if (!emp_id || !emp_name || !password) {
      return res.status(400).json({ message: 'emp_id, emp_name, and password are required' });
    }

    // Validate emp_id against User model
    const matchingUser = await user.findOne({ where: { unique_id: emp_id, role: 'teacher' } });
    if (!matchingUser) {
      return res.status(400).json({ error: 'No matching user found with role teacher' });
    }
    if (matchingUser.unique_id !== emp_id) {
      return res.status(400).json({ error: 'Employee ID does not match the unique ID in the User model' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await teacher.create({
      emp_id,
      emp_name,
      email,
      subjects,
      password: hashedPassword,
      phone_no,
      joining_date,
      is_active,
      role,
      status,
    });

    return res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacher.findAll();
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
    const { emp_name, email, subjects, password, phone_no, joining_date, status } = req.body;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields if provided
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
    return res.status(200).json({ message: 'Teacher updated successfully', teacher: foundTeacher });
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

exports.getStudentsByClassAndSection = async (req, res) => {
  try {
    const { emp_id } = req.params; // Teacher's employee ID
    const { className, section } = req.query; // Class & Section

    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    }

    const foundTeacher = await findTeacherById(emp_id, res);
    if (!foundTeacher) return;

    const queryCondition = { class: className };
    if (section) queryCondition.section = section;

    const students = await student.findAll({
      where: queryCondition,
      attributes: ['admission_no', 'student_name', 'roll_no', 'phone_no', 'dob', 'gender', 'status']
    });

    if (!students.length) {
      return res.status(404).json({
        message: section
          ? `No students found in Class ${className} Section ${section}`
          : `No students found in Class ${className}`
      });
    }

    return res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addStudentMarks = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const {
      admission_no,
      subjects,
      class_grade,
      exam_format,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date
    } = req.query; // Consider using req.body if it's a POST

    if (!admission_no || !subjects || !class_grade || !exam_format || !academic_year || marks_obtained === undefined || !total_marks) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const foundTeacher = await findTeacherById(emp_id, res);
    if (!foundTeacher) return;

    const foundStudent = await findStudentByAdmissionNo(admission_no, res);
    if (!foundStudent) return;

    const validExamFormat = await examformat.findOne({ where: { exam_name: exam_format } });
    if (!validExamFormat) {
      return res.status(400).json({ message: `Invalid exam format: ${exam_format}. Please provide a valid exam name.` });
    }

    const validSubject = await subject.findOne({ where: { subject_name: subjects } });
    if (!validSubject) {
      return res.status(400).json({ message: `Invalid subject name: ${subjects}. Please provide a valid subject name.` });
    }

    const studentMarks = await academics.create({
      admission_no,
      emp_id,
      subjects,
      class_grade,
      exam_format,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date
    });

    return res.status(201).json({ message: "Marks added successfully", studentMarks });
  } catch (error) {
    console.error("Error adding student marks:", error);
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
    const { admission_no, emp_id, date, status } = req.body;
    if (!admission_no || !emp_id || !date || !status) {
      return res.status(400).json({ message: "admission_no, emp_id, date, and status are required" });
    }

    const foundStudent = await findStudentByAdmissionNo(admission_no, res);
    if (!foundStudent) return;

    const newAttendance = await attendance.create({ admission_no, emp_id, date, status });
    return res.status(201).json({ message: "Attendance recorded successfully", newAttendance });
  } catch (error) {
    console.error("Error uploading attendance:", error);
    return res.status(500).json({ message: "Internal Server Error" });
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
      const { subjects, title, admission_no, Date: assignmentDate } = req.body;
      const { emp_id } = req.params;

      if (!subjects || !title || !assignmentDate || !admission_no || !emp_id || !req.file) {
        return res.status(400).json({
          message: "subject, title, Date, admission_no, emp_id, and attachment are required",
        });
      }

      const foundTeacher = await findTeacherById(emp_id, res);
      if (!foundTeacher) return;

      const foundStudent = await findStudentByAdmissionNo(admission_no, res);
      if (!foundStudent) return;

      const validSubject = await subject.findOne({ where: { subject_name: subjects } });
      if (!validSubject) {
        return res.status(400).json({ message: `Invalid subject name: ${subjects}. Please provide a valid subject name.` });
      }

      // Upload PDF to Azure Blob Storage
      const fileBuffer = req.file.buffer; // Assuming multer stores buffer
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const azureUrl = await uploadImageToAzure(fileBuffer, fileName);

      const newAssignment = await assignment.create({
        subjects,
        title,
        Date: assignmentDate,
        attachment: azureUrl, // Store Azure URL
        admission_no,
        emp_id,
        emp_name: foundTeacher.emp_name,
      });

      return res.status(201).json({
        message: "Assignment uploaded successfully",
        assignment: newAssignment,
      });
    } catch (error) {
      console.error("Error uploading assignment:", error);
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


const teacherAssignments = {}; // Object to store assignments in-memory

exports.assignSubjectsToTeacher = async (req, res) => {
  try {
    const { teacher_id, assignments } = req.body;

    if (!teacher_id || !assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const teacherRecord = await teacher.findOne({ where: { emp_id: teacher_id } });
    if (!teacherRecord) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Store assignments in an object (in-memory storage)
    teacherAssignments[teacher_id] = assignments;

    res.status(200).json({
      message: "Subjects assigned successfully",
      assignedSubjects: assignments,
    });

  } catch (error) {
    console.error("Error assigning subjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getAssignedSubjects = async (req, res) => {
  try {
    const { teacher_id } = req.params;

    if (!teacher_id) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    if (!teacherAssignments[teacher_id]) {
      return res.status(404).json({ message: "No subjects assigned to this teacher" });
    }

    res.status(200).json({
      message: "Assigned subjects retrieved successfully",
      assignedSubjects: teacherAssignments[teacher_id],
    });

  } catch (error) {
    console.error("Error retrieving assigned subjects:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getCertificates = async (req, res) => {
  try {
    const certificates = await achievement.findAll({
      include: {
        model: student,
        attributes: ['student_name'], // or 'student_name'
        required: false
      }
    });

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: "No certificates found" });
    }

    // Optional: Flatten student_mname into root level
    const formatted = certificates.map(cert => ({
      ...cert.toJSON(),
      student_name: cert.student?.student_name || null
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
    const leaves = await leaveapplication.findAll({
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({ leaves });
  } catch (error) {
    console.error("Error fetching leave applications:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



