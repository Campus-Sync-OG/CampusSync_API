const { user,student,fee ,schoolinfo} = require('../models');
const { uploadImageToAzure } = require('../services/AzureBlobService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage }).single('file');const multer = require('multer');
// Configure Multer for file uploads (in-memory storage)

exports.createUser = async (req, res) => {
  const { role, name, password,phone_number,status } = req.body;

  try {
    const newUser = await user.create({ role, name, password,phone_number,status });
    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({
      message: 'Error creating user',
      error: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  const { role } = req.query;

  try {
    const whereClause = role ? { role } : {};
    const users = await user.findAll({ where: whereClause });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error.message);
    res.status(500).json({
      message: 'Error retrieving users',
      error: error.message,
    });
  }
};

exports.getUserByUniqueId = async (req, res) => {
  const { unique_id } = req.params;

  try {
    if (!unique_id || typeof unique_id !== 'string') {
      return res.status(400).json({ message: 'Invalid unique_id provided' });
    }

    const user = await user.findOne({
      where: { unique_id: unique_id.trim() }, // Trim to avoid extra spaces
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error retrieving user:', error.message);
    res.status(500).json({
      message: 'Error retrieving user',
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { unique_id } = req.params;
  const { role, name, password } = req.body;

  try {
    const { user } = require('../models');
    if (!unique_id || typeof unique_id !== 'string') {
      return res.status(400).json({ message: 'Invalid unique_id provided' });
    }

    const userRecord = await user.findOne({
      where: { unique_id: unique_id.trim() },
    });

    if (userRecord) {
      await userRecord.update({ role, name, password });
      res.status(200).json({
        message: 'User updated successfully',
        user: userRecord,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).json({
      message: 'Error updating user',
      error: error.message,
    });
  }
};


exports.deleteUser = async (req, res) => {
  const { unique_id } = req.params;

  try {
    const { user } = require('../models');
    if (!unique_id || typeof unique_id !== 'string') {
      return res.status(400).json({ message: 'Invalid unique_id provided' });
    }

    const userRecord = await user.findOne({
      where: { unique_id: unique_id.trim() },
    });

    if (userRecord) {
      await userRecord.destroy();
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

exports.addFee = async (req, res) => {
  try {
      const { admission_no, pay_date, pay_method, paid_amount, receipt_no, status, due_date } = req.body;

      // Check if student exists for the provided admission_no
      const Student = await student.findOne({ where: { admission_no } });
      if (!Student) {
          return res.status(404).json({ message: "Student not found" });
      }

      // Create the new fee record
      const newFee = await fee.create({
          admission_no, 
          pay_date, 
          pay_method, 
          paid_amount, 
          receipt_no, 
          status, 
          due_date 
      });
      res.status(201).json(newFee);
  } catch (error) {
      console.error("Error adding fee:", error);
      res.status(500).json({ message: "Error adding fee" });
  }
};

exports.uploadWithMetadata = async (req, res) => {
  try {
    console.log("Received file:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const fileType = req.file.mimetype.startsWith("image") ? "image" : "video";
    const filePath = path.join(__dirname, "../", req.file.path);
    const fileBuffer = fs.readFileSync(filePath);
    const uploadDate = new Date().toISOString();

    // Upload with metadata
    const metadata = {
      category: "gallery",
      uploadDate,
      originalName: req.file.originalname,
    };

    const fileUrl = await uploadImageToAzure(fileBuffer, req.file.originalname, fileType, metadata);

    // Delete file from local storage after upload
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.status(201).json({
      message: "File uploaded successfully",
      url: fileUrl,
      metadata,
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.upload=upload;