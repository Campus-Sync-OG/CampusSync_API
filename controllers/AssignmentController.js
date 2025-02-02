const { assignment, student, teacher } = require('../models');
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


// Create a new assignment

const createAssignment = async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
  
      try {
        const { subject, title, Date, admission_no, emp_id } = req.body;
  
        if (!admission_no || !emp_id) {
          return res.status(400).json({ error: 'admission_no and emp_id are required' });
        }
  
        // Find the teacher by emp_id
        const teacherRecord = await teacher.findOne({ where: { emp_id } });
  
        if (!teacherRecord) {
          return res.status(404).json({ error: 'Teacher not found' });
        }
  
        // Ensure the file was uploaded
        if (!req.file) {
          return res.status(400).json({ error: 'PDF attachment is required' });
        }
  
        // Construct the file URL or path
        const filePath = req.file.path; // This is the path where the file is stored
  
        const newAssignment = await assignment.create({
          subject,
          title,
          Date,
          attachment: filePath, // Store the file path in the database
          admission_no,
          emp_id,
        });
  
        res.status(201).json({
          message: 'Assignment created successfully',
          data: {
            ...newAssignment.toJSON(),
            emp_name: teacherRecord.emp_name,
          },
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  };
// Get all assignments
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await assignment.findAll({
      include: [
        {
          model: student,
          as: 'student',
          attributes: ['admission_no','student_name'],
        },
        {
          model: teacher,
          as: 'teacher',
          attributes: ['emp_id', 'emp_name'],
        },
      ],
    });

    const result = assignments.map((assignment) => {
      const { teacher, ...assignmentData } = assignment.toJSON();
      return {
        ...assignmentData,
        emp_name: teacher ? teacher.emp_name : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignments by admission number
const getAssignmentsByAdmissionNo = async (req, res) => {
  try {
    console.log('admission_no:', req.params.admission_no); // Debugging
    const { admission_no } = req.params;

    if (!admission_no) {
      return res.status(400).json({ error: 'admission_no is required in the URL parameters' });
    }

    const assignments = await assignment.findAll({
      where: { admission_no },
      include: [
        {
          model: student,
          as: 'student',
          attributes: ['admission_no', 'student_name'],
        },
        {
          model: teacher,
          as: 'teacher',
          attributes: ['emp_id', 'emp_name'],
        },
      ],
    });

    if (assignments.length === 0) {
      return res.status(404).json({ message: 'No assignments found for this admission number.' });
    }

    const result = assignments.map((assignment) => {
      const { teacher, ...assignmentData } = assignment.toJSON();
      return {
        ...assignmentData,
        emp_name: teacher ? teacher.emp_name : null,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { admission_no } = req.params;

      if (!admission_no) {
        return res.status(400).json({ error: 'admission_no is required in the URL parameters' });
      }

      const assignmentRecord = await assignment.findOne({ where: { admission_no } });

      if (!assignmentRecord) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // Continue with the update logic...
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const assignmentRecord = await assignment.findOne({ where: { admission_no } });

    if (!assignmentRecord) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    await assignmentRecord.destroy();

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentsByAdmissionNo,
  updateAssignment,
  deleteAssignment,
};
