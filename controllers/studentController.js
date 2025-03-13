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
    console.log("Received Request Body:", req.body); // Debugging log
    console.log("Received File:", req.file); // Debugging log

    const { admission_no, student_name, password, phone_no, alter_no, dob, gender, status, class: classname, section, roll_no } = req.body;

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

    res.status(201).json({ message: "Student created successfully", student: newStudent });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: error.message });
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

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { student_name, password, phone_no, alter_no, dob, gender, status, class: classname, section } = req.body;

    const studentRecord = await student.findOne({ where: { admission_no } });
    if (!studentRecord) return res.status(404).json({ message: 'Student not found' });

    // Only update fields if a new value is provided
    if (student_name) studentRecord.student_name = student_name;
    if (password) studentRecord.password = password;
    if (phone_no) studentRecord.phone_no = phone_no;
    if (alter_no) studentRecord.alter_no = alter_no;
    if (dob) studentRecord.dob = dob;
    if (gender) studentRecord.gender = gender;
    if (status) studentRecord.status = status;
    if (classname) studentRecord.class = classname;
    if (section) studentRecord.section = section;

    // Save the updated student record
    await studentRecord.save();

    res.status(200).json({
      message: 'Student updated successfully',
      student: studentRecord,
    });
  } catch (error) {
    console.error('Error updating student:', error.message);
    res.status(500).json({
      message: 'Error updating student',
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


