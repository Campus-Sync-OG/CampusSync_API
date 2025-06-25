const { student, user, achievement, feedback, certificates, leaveapplication, class_section, circular, teacher_subject, teacher, assignment, student_assignment, teacher_class_sections } = require("../models");

const { uploadImageToAzure, deleteImageFromAzure } = require("../services/AzureBlobService");
const multer = require("multer");
const sharp = require("sharp"); // Optional, for image processing

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and image files are allowed."), false);
    }
  },
});

// Create a student with profile picture upload
exports.createStudent = async (req, res) => {
  try {
    const {
      admission_no,
      student_name,
      phone_no,
      alter_no,
      dob,
      gender,
      status,
      class: classname,
      section,
      roll_no
    } = req.body;
    console.log("Received student data:", req.body);

    // Validate required fields
    if (!admission_no || !student_name || !classname || !section || !roll_no) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // Check if user exists
    const userRecord = await user.findOne({
      where: { unique_id: admission_no, role: "student" }
    });

    if (!userRecord) {
      return res.status(400).json({ message: `No user found with unique_id '${admission_no}' and role 'student'` });
    }

    // ✅ Check if class-section exists
    const classSectionExists = await class_section.findOne({
      where: {
        className: classname,
        section_name: section
      }
    });
    if (!classSectionExists) {
      return res.status(400).json({ message: `Class '${classname}' with section '${section}' does not exist` });
    }

    // Handle image if present
    let imageUrl = null;
    if (req.file) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("jpeg")
        .toBuffer();

      imageUrl = await uploadImageToAzure(resizedImageBuffer, req.file.originalname, "student-profiles");
    }

    // Create the student
    const newStudent = await student.create({
      admission_no,
      student_name,
      phone_no,
      alter_no,
      dob,
      gender,
      status,
      class: classname,
      section,
      roll_no,
      images: imageUrl
    });

    res.status(201).json({ message: 'Student created successfully', student: newStudent });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await student.findAll({
      attributes: [
        'admission_no',
        'student_name',
        'class',
        'section',
        'status',
        'phone_no',
        'roll_no',
        'images',
        'dob',
        'gender'
      ],
      order: [['class', 'ASC'], ['roll_no', 'ASC'], ['section', 'ASC'], ['student_name', 'ASC']],

    });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get a student by admission number, class, and section
exports.getStudentByAdmissionNo = async (req, res) => {
  try {
    const { admission_no } = req.params;


    const studentRecord = await student.findOne({
      where: { admission_no },
    });

    if (!studentRecord) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(studentRecord);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const updateFields = req.body;

    const studentRecord = await student.findOne({ where: { admission_no } });

    if (!studentRecord) {
      console.log(" Student not found for admission_no:", admission_no);
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Existing Student Data:", studentRecord.toJSON());

    let updatedFields = {}; // Track updated fields

    // Handle profile picture update
    if (req.file) {
      console.log(" Profile picture upload detected");

      if (studentRecord.images) {
        await deleteImageFromAzure(studentRecord.images);
      }

      try {
        const resizedImageBuffer = await sharp(req.file.buffer)
          .resize(200, 200)
          .toFormat("jpeg")
          .toBuffer();

        const imageUrl = await uploadImageToAzure(
          resizedImageBuffer,
          req.file.originalname,
          "student-profiles"
        );

        updatedFields.images = imageUrl;
        console.log(" Uploaded Image URL:", imageUrl);
      } catch (error) {
        console.error(" Image Upload Failed:", error.message);
        return res.status(500).json({ message: "Image upload failed", error: error.message });
      }
    }

    //  List of allowed fields to update
    const allowedFields = [
      "student_name",
      "phone_no",
      "alter_no",
      "dob",
      "gender",
      "status",
      "class",
      "section",
      "roll_no",
    ];

    for (const field of allowedFields) {
      if (updateFields[field] !== undefined && String(studentRecord[field]) !== String(updateFields[field])) {
        updatedFields[field] = updateFields[field];
      }
    }

    console.log(" Fields to Update:", updatedFields);

    if (Object.keys(updatedFields).length === 0) {
      console.log("No changes detected");
      return res.status(200).json({ message: "No changes detected" });
    }

    // Update student record
    await studentRecord.update(updatedFields);

    // Fetch updated record
    const updatedStudent = await student.findOne({ where: { admission_no } });

    console.log("Student updated successfully:", updatedStudent.toJSON());

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error(" Error updating student:", error.message);
    res.status(500).json({
      message: "Error updating student",
      error: error.message,
    });
  }
};


// Soft delete a student
exports.softDeleteStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const studentRecord = await student.findOne({ where: { admission_no } });

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found" });
    }

    await studentRecord.destroy(); // This soft-deletes the record (doesn't remove from DB)

    res.status(200).json({ message: "Student soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting student:", error);
    res.status(500).json({ message: "Failed to soft delete student", error: error.message });
  }
};

exports.uploadCertificate = async (req, res) => {
  try {
    const { admission_no, title, description, className, section } = req.body;

    if (!admission_no || !title || !className || !section) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Certificate file is required" });
    }

    // Upload certificate to Azure Blob Storage
    const certificateUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname, "certificates");

    // Store record in the database
    const newAchievement = await achievement.create({
      admission_no,
      className,
      section,
      title,
      description,
      Certificateurl: certificateUrl,
    });

    res.status(201).json({ message: "Certificate uploaded successfully", achievement: newAchievement });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.deleteCertificate = async (req, res) => {
  try {
    const { admission_no } = req.params;

    // Find the certificate records in the database by admission_no
    const certificates = await achievement.findAll({ where: { admission_no } });
    if (!certificates.length) {
      return res.status(404).json({ message: "No certificates found for this admission number" });
    }

    // Delete all certificates and their associated files from Azure Blob Storage
    for (const certificate of certificates) {
      if (certificate.Certificateurl) {
        await deleteImageFromAzure(certificate.Certificateurl);
      }
      await certificate.destroy();
    }

    res.status(200).json({ message: "All certificates deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificates:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.requestCertificate = async (req, res) => {
  try {
    const { admission_no, certificate_type, reason } = req.body;

    const validTypes = [
      'Transfer Certificate',
      'Character Certificate',
      'Study Certificate',
      'Migration Certificate',
      'Scholarship Certificate',
    ];

    if (!admission_no || !certificate_type) {
      return res.status(400).json({ message: "admission_no, certificate_type, and date are required." });
    }

    if (!validTypes.includes(certificate_type)) {
      return res.status(400).json({ error: 'Invalid certificate type' });
    }

    const request = await certificates.create({
      admission_no,
      certificate_type,
      reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'Certificate request submitted successfully!!',
      data: request,
    });
  } catch (error) {
    console.error('Error submitting certificate request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.upload = upload;
exports.createFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Feedback message is required" });
    }

    const newFeedback = await feedback.create({ message });

    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Error submitting feedback", error: error.message });
  }
};

// Submit leave application
exports.submitLeaveApplication = async (req, res) => {
  try {
    const { admission_no, reason, from_date, to_date } = req.body;

    if (!admission_no || !reason || !from_date || !to_date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1️⃣ Fetch student record
    const studentRecord = await student.findOne({
      where: { admission_no }
    });

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { class: class_name, section: section_name } = studentRecord;

    if (!class_name || !section_name) {
      return res.status(400).json({ message: "Student class or section not set" });
    }

    // 2️⃣ Find the class teacher (assume 1 teacher per class/section or pick first if multiple)
    const teacher = await teacher_class_sections.findOne({
      where: {
        class_name,
        section_name
      }
    });

    if (!teacher) {
      return res.status(404).json({
        message: "No teacher found for this class and section"
      });
    }

    const { emp_id } = teacher; // assuming teacher_class_sections has emp_id

    // 3️⃣ Create leave application and store emp_id
    const leave = await leaveapplication.create({
      admission_no,
      reason,
      from_date,
      to_date,
      status: "pending",
      created_at: new Date(),
      emp_id // store emp_id of the teacher
    });

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave
    });

  } catch (error) {
    console.error("Error submitting leave:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    });
  }
};



exports.getCircularByAdmissionNo = async (req, res) => {
  try {
    const { admission_no } = req.params; // Get admission_no from request URL

    const circularData = await circular.findAll({
      where: { admission_no },
      attributes: ['date', 'headline', 'note', 'attachment_url'], // Select only required fields
      order: [['date', 'DESC']] // Optional: newest first
    });

    if (circularData.length === 0) {
      return res.status(404).json({ error: "No circulars found for this admission number" });
    }

    res.status(200).json(circularData);
  } catch (error) {
    console.error("Get Circular By Admission No Error:", error);
    res.status(500).json({ error: "Failed to fetch circulars", details: error.message });
  }
};

exports.studentUploadAssignment = async (req, res) => {
  try {
    const { subject_name, title } = req.body;
    const { admission_no } = req.params;

    if (!subject_name || !title || !req.file || !admission_no) {
      return res.status(400).json({
        message: "subject_name, title, admission_no, and file are required",
      });
    }

    // ✅ Fetch student
    const foundStudent = await student.findOne({ where: { admission_no } });
    if (!foundStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { class: class_name, section } = foundStudent;

    let emp_id, emp_name;

    // ✅ Check if assignment already exists for same student and subject
    const existingAssignment = await assignment.findOne({
      where: { admission_no, subjects: subject_name },
    });

    if (existingAssignment) {
      // 🔁 Reuse existing teacher details
      emp_id = existingAssignment.emp_id;
      emp_name = existingAssignment.emp_name;
    } else {
      // 🔍 Lookup assigned teacher if no existing assignment
      const teacherSubject = await teacher_subject.findOne({
        where: { subjects: subject_name, class_name, section },
        include: [{ model: teacher, attributes: ['emp_id', 'emp_name'] }],
      });

      if (!teacherSubject || !teacherSubject.Teacher) {
        return res.status(404).json({
          message: "No teacher assigned for this subject/class/section",
        });
      }

      emp_id = teacherSubject.Teacher.emp_id;
      emp_name = teacherSubject.Teacher.emp_name;
    }

    // ✅ Upload to Azure
    const fileBuffer = req.file.buffer;
    const fileName = `${Date.now()}_${req.file.originalname}`;
    const azureUrl = await uploadImageToAzure(fileBuffer, fileName);

    // ✅ Save assignment
    const newAssignment = await student_assignment.create({
      title,
      subject_name,
      class_name,
      section,
      admission_no,
      attachment: azureUrl,
      emp_id,
      emp_name,
      Date: new Date(),
    });

    return res.status(201).json({
      message: "Assignment uploaded successfully",
      assignment: newAssignment,
    });

  } catch (error) {
    console.error("Error during student assignment upload:", error.message, error.stack);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getStudentsByClassAndSection = async (req, res) => {
  try {
    const { className, section } = req.query;
    console.log("Fetching students for class:", className, "section:", section);

    if (!className) {
      return res.status(400).json({ message: 'Class is required' });
    }

    // Build query condition based on className and section
    const queryCondition = { class: className };
    if (section) {
      queryCondition.section = section;
    }

    // Fetch students
    const students = await student.findAll({
      where: queryCondition,
      attributes: [
        'admission_no',
        'student_name',
        'roll_no',
        'phone_no',
        'dob',
        'gender',
        'status',
        'class',
        'section',
      ],
      order: [['roll_no', 'ASC']],
    });

    if (!students.length) {
      return res.status(404).json({
        message: section
          ? `No students found in Class ${className} Section ${section}`
          : `No students found in Class ${className}`,
      });
    }

    return res.status(200).json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};




exports.upload = upload;


