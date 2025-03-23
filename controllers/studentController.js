const { student, user } = require("../models");
const { uploadImageToAzure, deleteImageFromAzure } = require("../services/AzureBlobService");
const multer = require("multer");
const sharp = require("sharp"); // For image resizing and validation

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG are allowed."), false);
    }
  },
});

// Create a student with profile picture upload
exports.createStudent = async (req, res) => {
  try {
    const { admission_no, student_name, password, phone_no, alter_no, dob, gender, status, class: classname, section, roll_no } = req.body;

    // Validate required fields
    if (!admission_no || !student_name || !password || !classname || !section || !roll_no) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (!admission_no) {
      return res.status(400).json({ message: "Admission number is required" });
    }

    // Check if the user exists
    const userRecord = await user.findOne({ where: { unique_id: admission_no, role: "student" } });

    if (!userRecord) {
      return res.status(400).json({ message: `No user found with unique_id '${admission_no}' and role 'student'` });
    }

    let imageUrl = null;
    if (req.file) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("jpeg")
        .toBuffer();

      imageUrl = await uploadImageToAzure(resizedImageBuffer, req.file.originalname, "student-profiles");
    }

    // Create the student record
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
      images: imageUrl,
    });
    res.status(201).json({ message: 'Student created successfully', student: newStudent });

  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: "Internal Server Error" });
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
exports.deleteStudentImage = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const studentRecord = await student.findOne({ where: { admission_no } });

    if (!studentRecord || !studentRecord.image) {
      return res.status(404).json({ message: "Student or image not found" });
    }

    await deleteImageFromAzure(studentRecord.image);
    studentRecord.image = null;
    await studentRecord.save();

    res.status(200).json({ message: "Profile picture deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ message: "Failed to delete profile picture", error: error.message });
  }
};
exports.upload=upload;


