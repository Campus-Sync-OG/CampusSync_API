const { teacher, student, academics, examformat, user, attendance, assignment, subject, achievement, leaveapplication, circular,teacher_subject } = require('../models');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { uploadImageToAzure } = require('../services/AzureBlobService');
const teacherAssignments = {}; // Object to store assignments in-memory

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
    const { records, emp_id, date } = req.body;

    // Ensure that records, emp_id, and date are provided
    if (!records || !emp_id || !date) {
      return res.status(400).json({ message: "Missing required fields: records, emp_id, date" });
    }

    // Find the teacher
    const foundTeacher = await findTeacherById(emp_id, res);
    if (!foundTeacher) return;

    const updatedRecords = [];
    const failedRecords = [];

    for (const record of records) {
      const { admission_no, status } = record;

      // Find the student by admission number
      const foundStudent = await findStudentByAdmissionNo(admission_no, res);
      if (!foundStudent) {
        failedRecords.push({ admission_no, status, message: "Student not found" });
        continue;
      }

      // Create the attendance record for this student
      const attendanceRecord = await attendance.create({ admission_no, emp_id, date, status });
      updatedRecords.push({ admission_no, status, created: true });
    }

    // Respond with updated records and any failed attempts
    return res.status(200).json({
      message: "Bulk attendance update completed",
      updatedRecords,
      failedRecords,
    });

  } catch (error) {
    console.error("Error uploading bulk attendance:", error);
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

exports.uploadCircular = async (req, res) => {
  try {
    const { title, description, date, class_name, section } = req.body;
    const file = req.file;

    if (!title || !description || !date || !class_name || !section) {
      return res.status(400).json({ error: "Title, description, date, class_name, and section are required" });
    }

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload file to Azure Blob Storage
    const blobUrl = await uploadImageToAzure(file.buffer, fileName);

    if (!blobUrl) {
      return res.status(500).json({ error: "File upload failed" });
    }

    // Fetch students by class_name and section
    const students = await student.findAll({ where: { class: class_name, section } });
    const admissionNos = students.map((s) => s.admission_no);

    // Loop through the admissionNos array and create a new circular record for each
    const circulars = [];
    for (const admission_no of admissionNos) {
      const newCircular = await circular.create({
        date,
        headline: title,
        note: description,
        attachment_url: blobUrl,
        class_name,
        section,
        admission_no, // Store each admission_no individually
      });
      circulars.push(newCircular);
    }

    return res.status(201).json({
      message: "Circulars uploaded successfully for each student",
      circulars,
    });

  } catch (error) {
    console.error("Upload Circular Error:", error);
    return res.status(500).json({ error: "Failed to upload circular", details: error.message });
  }
};




