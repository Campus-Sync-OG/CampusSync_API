const { teacher,student,academics,examformat,user,attendance,assignment } = require('../models');
const bcrypt = require('bcrypt'); // For password hashing
const multer = require('multer');
const path = require('path');

// Set up multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});
 
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
// Create a new teacher
exports.createTeacher = async (req, res) => {
  try {
    const { emp_id, emp_name, email, subject, password, phone_no, joining_date, is_active, role, status } = req.body;

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

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = await teacher.create({
      emp_id,
      emp_name,
      email,
      subject,
      password: hashedPassword,
      phone_no,
      joining_date,
      is_active,
      role,
      status,
    });

    res.status(201).json({ message: 'Teacher created successfully', teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacher.findAll();
    if (teachers.length === 0) {
      return res.status(404).json({ message: 'No teachers found' });
    }

    res.status(200).json({ teachers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a teacher by emp_id
exports.getTeacherById = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ teacher: foundTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a teacher
exports.updateTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { emp_name, email, subject, password, phone_no, joining_date, status } = req.body;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Update fields
    foundTeacher.emp_name = emp_name || foundTeacher.emp_name;
    foundTeacher.email = email || foundTeacher.email;
    foundTeacher.subject = subject || foundTeacher.subject;
    foundTeacher.status = status || foundTeacher.status;

    if (password) {
      // Hash the new password before saving
      foundTeacher.password = await bcrypt.hash(password, 10);
    }

    foundTeacher.phone_no = phone_no || foundTeacher.phone_no;
    foundTeacher.joining_date = joining_date || foundTeacher.joining_date;

    await foundTeacher.save();

    res.status(200).json({ message: 'Teacher updated successfully', teacher: foundTeacher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a teacher
exports.softDeleteTeacher = async (req, res) => {
  try {
    const { emp_id } = req.params;

    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Soft delete the teacher (if you mean marking as inactive)
    await foundTeacher.update({ is_active: false });

    res.status(200).json({ message: 'Teacher soft-deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.getStudentsByClassAndSection = async (req, res) => {
  try {
    const { emp_id } = req.params; // Teacher's employee ID
    const { className, section } = req.query; // Class & Section from query parameters

    // Validate input: className is required, section is optional
    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    } 

    // Check if the teacher exists
    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Query condition: Always filter by class, section is optional
    let queryCondition = { class: className };
    if (section) {
      queryCondition.section = section;
    }

    // Fetch students based on provided filters
    const students = await student.findAll({
      where: queryCondition,
      attributes: ['admission_no', 'student_name', 'roll_no', 'phone_no', 'dob', 'gender', 'status']
    });

    if (students.length === 0) {
      return res.status(404).json({
        message: section
          ? `No students found in Class ${className} Section ${section}`
          : `No students found in Class ${className}`
      });
    }

    res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.addStudentMarks = async (req, res) => {
  try {
    const { emp_id } = req.params; // Teacher's Employee ID
    const {
      admission_no,
      subject,
      class_grade,
      exam_format,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date
    } = req.query; // Data from request body

    // Validate input
    if (!admission_no || !subject || !class_grade || !exam_format || !academic_year || marks_obtained === undefined || !total_marks) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the teacher exists
    const foundTeacher = await teacher.findOne({ where: { emp_id } });

    if (!foundTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the student exists
    const foundStudent = await student.findOne({ where: { admission_no } });

    if (!foundStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if the exam_format exists in the examformat table
    const validExamFormat = await examformat.findOne({ where: { exam_name: exam_format } });

    if (!validExamFormat) {
      return res.status(400).json({ message: `Invalid exam format: ${exam_format}. Please provide a valid exam name.` });
    }

    // Add or Update Student Marks
    const studentMarks = await academics.create({
      admission_no,
      emp_id,
      subject,
      class_grade,
      exam_format,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date
    });

    res.status(201).json({ message: "Marks added successfully", studentMarks });
  } catch (error) {
    console.error("Error adding student marks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateAcademicRecord = async (req, res) => {
  try {
    const { emp_id } = req.params; // Teacher's employee ID (used only for validation)
    const { admission_no, subject, exam_format, marks_obtained, total_marks, academic_year, exam_date } = req.body;

    if (!admission_no || !subject || !exam_format) {
      return res.status(400).json({ message: "Admission no, subject, and exam format are required." });
    }

    // Validate the teacher exists
    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Validate the student exists
    const foundStudent = await student.findOne({ where: { admission_no } });
    if (!foundStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find the academic record
    const academicRecord = await academics.findOne({
      where: { admission_no, subject, exam_format },
    });

    if (!academicRecord) {
      return res.status(404).json({ message: "Academic record not found." });
    }

    // Update the academic record
    await academicRecord.update({
      marks_obtained: marks_obtained !== undefined ? marks_obtained : academicRecord.marks_obtained,
      total_marks: total_marks !== undefined ? total_marks : academicRecord.total_marks,
      academic_year: academic_year || academicRecord.academic_year,
      exam_date: exam_date || academicRecord.exam_date,
    });

    res.status(200).json({ message: "Academic record updated successfully.", data: academicRecord });

  } catch (error) {
    console.error("Error updating academic record:", error);
    res.status(500).json({ message: "An error occurred while updating the record." });
  }
};

exports.uploadAttendance = async (req, res) => {
  try {
    const { admission_no, emp_id, date, status } = req.body; // Get attendance details

    if (!admission_no || !emp_id || !date || !status) {
      return res.status(400).json({ message: "admission_no, emp_id, date, and status are required" });
    }

    // Check if the student exists
    const foundStudent = await student.findOne({ where: { admission_no } });

    if (!foundStudent) {
      return res.status(404).json({ message: `Student with admission_no ${admission_no} not found` });
    }

    // Create attendance record
    const newAttendance = await attendance.create({
      admission_no,
      emp_id,
      date,
      status,
    });

    res.status(201).json({ message: "Attendance recorded successfully", newAttendance });
  } catch (error) {
    console.error("Error uploading attendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateAttendance = async (req, res) => {
  try {
    // Get details from request body
    const { admission_no, emp_id, date, status } = req.body;

    // Validate required fields
    if (!admission_no || !emp_id || !date || !status) {
      return res.status(400).json({ message: "admission_no, emp_id, date, and status are required." });
    }

    // Validate that the teacher exists (using emp_id)
    const foundTeacher = await teacher.findOne({ where: { emp_id } });
    if (!foundTeacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Validate that the student exists using admission_no
    const foundStudent = await student.findOne({ where: { admission_no } });
    if (!foundStudent) {
      return res.status(404).json({ message: `Student with admission_no ${admission_no} not found.` });
    }

    // Find the existing attendance record using admission_no and date
    // (You might need to adjust the composite key or add additional conditions based on your model)
    const attendanceRecord = await attendance.findOne({
      where: { admission_no, date }
    });

    if (!attendanceRecord) {
      return res.status(404).json({ message: "Attendance record not found." });
    }

    // Update the attendance record with the new status
    await attendanceRecord.update({
      status: status
    });

    res.status(200).json({ message: "Attendance updated successfully.", data: attendanceRecord });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "An error occurred while updating the attendance record." });
  }
};

exports.uploadAssignment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { subject, title, admission_no, Date: assignmentDate } = req.body;
      const { emp_id } = req.params; // Extract emp_id from the URL parameters

      // Validate that all required fields are provided
      if (!subject || !title || !assignmentDate || !admission_no || !emp_id || !req.file) {
        return res.status(400).json({ message: "subject, title, Date, admission_no, emp_id, and attachment are required" });
      }

      // Check if the teacher exists and get emp_name
      const foundTeacher = await teacher.findOne({ where: { emp_id } });
      if (!foundTeacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const emp_name = foundTeacher.emp_name; // Fetch the emp_name from the teacher record

      // Check if the student exists
      const foundStudent = await student.findOne({ where: { admission_no } });
      if (!foundStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Get file path from multer
      const filePath = req.file.path;

      // Create assignment record in the database with emp_name
      const newAssignment = await assignment.create({
        subject,
        title,
        Date: assignmentDate,
        attachment: filePath,
        admission_no,
        emp_id,
        emp_name, // Store emp_name in the assignment table
      });

      res.status(201).json({ message: "Assignment uploaded successfully", assignment: newAssignment });
    } catch (error) {
      console.error("Error uploading assignment:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

