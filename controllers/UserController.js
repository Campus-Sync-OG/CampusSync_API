const { user,student,fee ,schoolinfo} = require('../models');
const multer = require('multer');
// Configure Multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
exports.assignClassTeacher = async (req, res) => {
  try {
    const { emp_id, class:className, section } = req.body;

    if (!emp_id || !className|| !section) {
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
    const { emp_id, subject } = req.query ;

    if (!emp_id || !subject) {
      return res.status(400).json({ message: "emp_id and subject are required" });
    }

    // Check if the teacher exists
    const teachers = await teacher.findOne({ where: { emp_id } });
    if (!teachers) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    

    // Return updated teacher details
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

exports.uploadWithMetadata = async (req, res) => {
  try {
      if (!req.file) return res.status(400).json({ message: "File is required" });

      const blobName = `${Date.now()}-${req.file.originalname}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Define expiry timestamp
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Expires in 1 hour

      // Upload file with metadata
      await blockBlobClient.uploadStream(streamifier.createReadStream(req.file.buffer), req.file.size, undefined, {
          metadata: { expires_at: expiresAt.toISOString() }
      });

      res.status(201).json({ message: "File uploaded", url: blockBlobClient.url });

  } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

