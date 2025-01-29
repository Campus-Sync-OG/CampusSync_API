const fs = require('fs');
const path = require('path');
const { assignment } = require('../models');
const {student}=require('../models');
const {teacher}=require('../models');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '../uploads/assignments'); // Path to store uploaded files
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
            }
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    }),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Create a new assignment
const createAssignment = async (req, res) => {
    try {
        upload.single('attachment')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const { teacherName, subject, title, Date, admission_no, emp_id } = req.body;

            if (!admission_no) {
                return res.status(400).json({ error: 'admission_no is required' });
            }

            const newAssignment = await assignment.create({
                teacherName,
                subject,
                title,
                Date,
                attachment: req.file ? req.file.path : null, // Save file path if attachment exists
                admission_no,
                emp_id,
            });

            res.status(201).json({ message: 'Assignment created successfully', data: newAssignment });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all assignments
const getAllAssignments = async (req, res) => {
    try {
        const assignments = await assignment.findAll();
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get assignments by admission number
const getAssignmentsByAdmissionNo = async (req, res) => {
    try {
      const { admission_no } = req.params;
  
      // Fetch assignments related to the provided admission_no
      const assignments = await assignment.findAll({
        where: { admission_no },
        include: [
          {
            model: student,
            as: 'student',  // Assuming you have a 'student' model related to assignments
            attributes: ['admission_no', 'student_name'],
          },
          {
            model: teacher,
            as: 'teacher',  // Assuming you have a 'teacher' model related to assignments
            attributes: ['emp_id', 'emp_name'],
          },
        ],
      });
  
      // If no assignments are found for this admission_no, return a 404
      if (assignments.length === 0) {
        return res.status(404).json({ message: "No assignments found for this admission number." });
      }
  
      // Return the assignments with related student and teacher data
      return res.status(200).json(assignments);
    } catch (error) {
      // Send error response in case of failure
      return sendErrorResponse(res, 500, "Error fetching assignments.", error);
    }
  };
  

// Update assignment
const updateAssignment = async (req, res) => {
    try {
        // Access admission_no from URL parameters
        const { admission_no } = req.params;

        if (!admission_no) {
            return res.status(400).json({ error: 'admission_no is required' });
        }

        // Fetch the existing assignment record
        const assignmentRecord = await assignment.findOne({ where: { admission_no } });

        if (!assignmentRecord) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        // Handle file upload
        upload.single('attachment')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            // Update the assignment with new data
            const { teacherName, subject, title, Date, emp_id } = req.body;

            // Update the fields with the new data or retain the old values
            assignmentRecord.teacherName = teacherName || assignmentRecord.teacherName;
            assignmentRecord.subject = subject || assignmentRecord.subject;
            assignmentRecord.title = title || assignmentRecord.title;
            assignmentRecord.Date = Date || assignmentRecord.Date;
            assignmentRecord.emp_id = emp_id || assignmentRecord.emp_id;
            assignmentRecord.attachment = req.file ? req.file.path : assignmentRecord.attachment;

            // Save the updated assignment
            await assignmentRecord.save();

            res.status(200).json({ message: 'Assignment updated successfully', data: assignmentRecord });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Delete assignment
const deleteAssignment = async (req, res) => {
    try {
        const { admission_no } = req.params;
        if (!admission_no) {
            return res.status(400).json({ error: 'admission_no is required' });
        }

        const assignmentRecord = await assignment.findOne({ where: { admission_no } });

        if (!assignmentRecord) {
            return res.status(404).json({ message: 'Assignment not found' });
        }

        if (assignmentRecord.attachment) {
            fs.unlinkSync(assignmentRecord.attachment); // Delete the file
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