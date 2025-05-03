const { user, student, fee, schoolinfo, teacher, certificates, parent, subject, class_section, timetable, announcement, teacher_subject } = require('../models');
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

/*exports.createUser = async (req, res) => {
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
    })
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
};*/

exports.addFee = async (req, res) => {
  try {
    const { admission_no, pay_date, pay_method, paid_amount, receipt_no, status, due_date,feestype,class_name,section_name} = req.body;

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
      due_date,
      feestype,
      class_name,
      section_name  
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

exports.createParent = async (req, res) => {
  try {
    const { admission_no, father_name, father_contact, father_email, mother_name, mother_contact, mother_email, address, religion } = req.body;

    // Check if parent info already exists for the given admission_no
    const existingParent = await parent.findOne({ where: { admission_no } });
    if (existingParent) {
      return res.status(400).json({ success: false, message: "Parent info already exists for this admission number" });
    }

    const newParent = await parent.create({
      admission_no,
      father_name,
      father_contact,
      father_email,
      mother_name,
      mother_contact,
      mother_email,
      address,
      religion
    });

    res.status(201).json({ success: true, message: "Parent info created successfully", data: newParent });
  } catch (error) {
    console.error("Error creating parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateParent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const updatedData = req.body;

    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    await parent.update(updatedData, { where: { admission_no } });

    res.status(200).json({ success: true, message: "Parent info updated successfully" });
  } catch (error) {
    console.error("Error updating parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createSubjects = async (req, res) => {
  try {
    const { unique_id } = req.user; // Assuming you extract user from token middleware
    const { subject_names } = req.body; // Expecting an array like ["Math", "Science", "History"]

    if (!Array.isArray(subject_names) || subject_names.length === 0) {
      return res.status(400).json({ message: "An array of subject names is required." });
    }

    // Validate user role if needed
    const foundUser = await user.findOne({ where: { unique_id } });

    if (!foundUser || !['admin', 'operator'].includes(foundUser.role)) {
      return res.status(403).json({ message: "You are not authorized to create subjects." });
    }

    // Filter out invalid names
    const validSubjects = subject_names
      .filter((name) => typeof name === "string" && name.trim() !== "")
      .map((name) => ({ subject_name: name.trim() }));

    if (validSubjects.length === 0) {
      return res.status(400).json({ message: "No valid subject names provided." });
    }

    // Bulk insert
    const createdSubjects = await subject.bulkCreate(validSubjects);

    return res.status(201).json({
      message: "Subjects created successfully",
      subjects: createdSubjects,
    });
  } catch (error) {
    console.error("Error creating subjects:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name } = req.query;

    if (!subject_name) {
      return res.status(400).json({ message: "Subject name is required" });
    }

    const foundSubject = await subject.findByPk(id);
    if (!foundSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Update subject name
    await foundSubject.update({ subject_name });
    return res.status(200).json({
      message: "Subject updated successfully",
      subject: foundSubject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.createClassSection = async (req, res) => {
  try {
    const classSections = req.body;  // Expecting an array of class-section objects

    if (!Array.isArray(classSections) || classSections.length === 0) {
      return res.status(400).json({ message: "You must provide an array of class-section objects" });
    }

    // Validate each class-section
    for (const classSection of classSections) {
      const { className, section_name } = classSection;
      if (!className || !section_name) {
        return res.status(400).json({ message: "className and section_name are required for each class-section" });
      }
    }

    // Insert all class-sections at once using bulkCreate
    const newClassSections = await class_section.bulkCreate(classSections);

    res.status(201).json({
      message: `${newClassSections.length} class-section(s) created successfully`,
      data: newClassSections,
    });
  } catch (error) {
    console.error("Error creating class-sections:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


exports.deleteClassSection = async (req, res) => {
  try {
    const { id } = req.params;
    const classSection = await class_section.findByPk(id);

    if (!classSection) {
      return res.status(404).json({ message: "Class Section not found" });
    }

    // Delete the class-section
    await classSection.destroy();

    res.status(200).json({ message: "Class Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting class-section:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.uploadTimetable = async (req, res) => {
  try {
    const { className, section_name, schedule } = req.body;

    // 1. Check if class-section exists
    const classSection = await class_section.findOne({
      where: {
        className,
        section_name
      }
    });

    if (!classSection) {
      return res.status(404).json({ error: 'Class and Section not found' });
    }

    const classSectionId = classSection.id;

    // 2. Delete old entries for that class-section
    await timetable.destroy({ where: { classSectionId } });

    // 3. Prepare new entries
    const records = [];

    for (const day of Object.keys(schedule)) {
      for (const slot of schedule[day]) {
        records.push({
          classSectionId,
          day,
          time: slot.time,
          subject: slot.subject
        });
      }
    }

    // 4. Bulk insert
    await timetable.bulkCreate(records);

    res.status(200).json({ message: 'Timetable uploaded successfully' });

  } catch (error) {
    console.error('Error uploading timetable:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.assignSubjectToTeacher = async (req, res) => {
  try {
    const { emp_id, assignments } = req.body;

    // Validate assignments input
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'Assignments must be a non-empty array' });
    }

    // Fetch the teacher's emp_name based on emp_id
    const teacherRecord = await teacher.findOne({
      where: { emp_id },
      attributes: ['emp_name'] // Assuming emp_name is a field in the Teacher model
    });

    if (!teacherRecord) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const emp_name = teacherRecord.emp_name;

    // Prepare the data to insert, including the emp_name
    const dataToInsert = assignments.map(assign => ({
      emp_id,
      emp_name, // Store the emp_name in the teacher_subject table
      class_name: assign.class_name,
      section: assign.section,
      subjects: assign.subjects
    }));

    // Perform bulk insert
    const createdAssignments = await teacher_subject.bulkCreate(dataToInsert);

    res.status(201).json(createdAssignments);
  } catch (err) {
    console.error('Error assigning subjects to teacher:', err); // Log the error for debugging
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAssignedSubject= async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await teacher_subject.destroy({ where: { id } });
    
    if (deleted) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAssignedSubjects = async (req, res) => {
  try {
    const { class_name, section, role } = req.query;

    // Build where conditions dynamically
    const subjectWhere = {};
    if (class_name) subjectWhere.class_name = class_name;
    if (section) subjectWhere.section = section;

    const teacherWhere = {};
    if (role) teacherWhere.role = role;

    const assignedSubjects = await teacher_subject.findAll({
      where: subjectWhere,
      include: [
        {
          model: teacher,
          attributes: ['emp_id', 'emp_name', 'role'],
          where: teacherWhere
        }
      ]
    });

    const result = assignedSubjects.map(item => ({
      employeeID: item.teacher.emp_id,
      teacherName: item.teacher.emp_name,
      class: item.class_name,
      section: item.section,
      subject1: item.subjects[0] || '',
      subject2: item.subjects[1] || '',
      role: item.teacher.role
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching assigned subjects:', err);
    res.status(500).json({ error: err.message });
  }
};




exports.upload = upload;