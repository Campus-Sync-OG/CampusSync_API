const { student, user, achievement,feedback,certificates,leaveapplication ,class_section} = require("../models");
const { uploadImageToAzure, deleteImageFromAzure } = require("../services/AzureBlobService");
const multer = require("multer");
const sharp = require("sharp"); // For image resizing and validation

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF is allowed."), false);
    }
  },
});
// Create a student with profile picture upload


exports.createStudent = async (req, res) => {
  try {
    const {
      admission_no,
      student_name,
      password,
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
      password,
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
      attributes: ['admission_no', 'student_name', 'class', 'section', 'status'], // Includes class and section
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

    console.log(" Request Params:", req.params);
    console.log("Received update fields:", req.body);
    console.log(" File Upload Debug:", req.file);

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
      "password",
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
    const { admission_no, title, description, className, section, date } = req.body;

    if (!admission_no || !title || !className || !section || !date) {
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
      date,
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
    const { admission_no, certificate_type, reason, date } = req.body;

    const validTypes = [
      'bonafide',
      'transfer',
      'character',
      'study',
      'migration',
      'scholarship'
    ];

    if (!admission_no || !certificate_type || !date) {
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
      createdAt: new Date(date),
      updatedAt: new Date(date),
    });

    res.status(201).json({
      message: 'Certificate request submitted successfully',
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

    const leave = await leaveapplication.create({
      admission_no,
      reason,
      from_date,
      to_date,
      status: "Pending",
      created_at: new Date(),
    });

    res.status(201).json({
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("Error submitting leave:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.upload=upload;


