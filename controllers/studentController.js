const Student = require('../models/student');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded images
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedExtensions.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
  limits: { fileSize: 1024 * 1024 }, // Limit file size to 1MB
}).single('student_photo');

// Utility to handle upload
const handleUpload = (req, res) =>
  new Promise((resolve, reject) => {
    upload(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(req.file);
      }
    });
  });

// Validate image dimensions
const validateImageDimensions = async (imagePath) => {
  const imageDimensions = await sharp(imagePath).metadata();
  if (imageDimensions.width !== 300 || imageDimensions.height !== 400) {
    throw new Error('Photo must be passport size (300x400 pixels)');
  }
};

const BASE_URL = 'http://localhost:3000/uploads';

// Create a new student
// exports.createStudent = async (req, res) => {
//   try {
//     await handleUpload(req, res);
//     const { admission_no, student_name, password, phone_no, alter_no, dob, gender } = req.body;

//     if (!req.file) return res.status(400).json({ message: 'Student photo is required' });

//     await validateImageDimensions(req.file.path);
    
//     const imageUrl = `${BASE_URL}/${req.file.filename}`;

//     const newStudent = await Student.create({
//       admission_no,
//       student_name,
//       password,
//       phone_no,
//       alter_no,
//       student_photo: imageUrl,
//       dob,
//       gender,
//     });

//     res.status(201).json({ message: 'Student created successfully', student: newStudent });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
exports.createStudent = async (req, res) => {
  try {
    // Handle file upload if any (but make it optional)
    if (req.file) {
      await validateImageDimensions(req.file.path);
      const imageUrl = `${BASE_URL}/${req.file.filename}`;

      // Include the photo URL in the student creation if it's uploaded
      req.body.student_photo = imageUrl;
    }

    const { admission_no, student_name, password, phone_no, alter_no, dob, gender, student_photo } = req.body;

    const newStudent = await Student.create({
      admission_no,
      student_name,
      password,
      phone_no,
      alter_no,
      student_photo,  // Will be null if no photo is uploaded
      dob,
      gender,
    });

    res.status(201).json({ message: 'Student created successfully', student: newStudent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a student by admission number
exports.getStudentByAdmissionNo = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const student = await Student.findOne({ where: { admission_no } });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    await handleUpload(req, res);
    const { admission_no } = req.params;
    const { student_name, password, phone_no, alter_no, dob, gender } = req.body;

    const student = await Student.findOne({ where: { admission_no } });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    student.student_name = student_name || student.student_name;
    student.password = password || student.password;
    student.phone_no = phone_no || student.phone_no;
    student.alter_no = alter_no || student.alter_no;
    student.dob = dob || student.dob;
    student.gender = gender || student.gender;

    if (req.file) {
      await validateImageDimensions(req.file.path);
      student.student_photo = `${BASE_URL}/${req.file.filename}`;
    }

    await student.save();
    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const student = await Student.findOne({ where: { admission_no } });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    await student.destroy();
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
