const { user, student, fee, schoolinfo, teacher,certificates } = require('../models');
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

const upload = multer({ storage }).single('file');
// Configure Multer for file uploads (in-memory storage)

exports.createUser = async (req, res) => {
  const { role, name, password, phone_number, status } = req.body;

  try {
    const newUser = await user.create({ role, name, password, phone_number, status });
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

exports.assignClassTeacher = async (req, res) => {
  try {
    const { emp_id, class: className, section } = req.body;

    if (!emp_id || !className || !section) {
      return res.status(400).json({ message: "emp_id, class, and section are required" });
    }

    // Check if the teacher exists
    const teachers = await teacher.findOne({ where: { emp_id } });
    if (!teachers) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the class and section exist in the students table
    const studentExists = await student.findOne({ where: { class: className, section } });
    if (!studentExists) {
      return res.status(400).json({ message: "Invalid class or section" });
    }

    // Update the teacher's role to "class teacher"
    await teacher.update(
      { role: "classTeacher" },
      { where: { emp_id } }
    );

    // Return updated teacher details
    return res.status(200).json({
      message: "Class teacher assigned successfully and role updated",
      data: {
        emp_id: teachers.emp_id,
        emp_name: teachers.emp_name,
        role: "classTeacher",
        class: className,
        section,
      },
    });

  } catch (error) {
    console.error("Error assigning class teacher:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.assignSubjectTeacher = async (req, res) => {
  try {
    const { emp_id, subject } = req.query;

    if (!emp_id || !subject) {
      return res.status(400).json({ message: "emp_id and subject are required" });
    }

    // Check if the teacher exists
    const teachers = await teacher.findOne({ where: { emp_id } });
    if (!teachers) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    return res.status(200).json({
      message: "Subject teacher assigned successfully and role updated",
      data: {
        emp_id: teachers.emp_id,
        emp_name: teachers.emp_name,
        role: "subjectTeacher",
        subject,
      },
    });

  } catch (error) {
    console.error("Error assigning subject teacher:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createSchool = async (req, res) => {
  try {
    const school = await schoolinfo.create(req.body);
    res.status(201).json(school);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    const [updated] = await schoolinfo.update(req.body, {
      where: { id: req.params.id },
    });
    if (!updated) return res.status(404).json({ error: 'School not found' });
    const updatedSchool = await schoolinfo.findByPk(req.params.id);
    res.status(200).json(updatedSchool);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 2. Get all requests for a student
exports.getStudentRequests = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const requests = await certificates.findAll({
      where: { admission_no }
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching student requests:', error);
    res.status(500).json({ error: 'Failed to retrieve certificate requests' });
  }
};

// 3. Get all certificate requests (admin use)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await certificates.findAll();
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch requests' });
  }
};

// 4. Update certificate request status (approve or reject)
exports.updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await certificates.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Certificate request not found' });
    }

    request.status = status;
    await request.save();

    res.status(200).json({ message: 'Status updated successfully', data: request });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { title, date, message, status } = req.body;
    const user_id = req.user.unique_id;

    // Create the announcement
    const Announcement = await announcement.create({
      title,
      date,
      message,
      status,
      user_id, // This should match unique_id from User
    });

    res.status(201).json({ success: true, Announcement });
  } catch (error) {
    console.error(error); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.upload = upload;