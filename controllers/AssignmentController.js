const { assignment, student, teacher } = require('../models');
const {deleteImageFromAzure}=require('../services/AzureBlobService');

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

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { admission_no } = req.params;

    // Find the assignment
    const assignmentRecord = await assignment.findOne({ where: { admission_no } });

    if (!assignmentRecord) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Delete the file from Azure
    if (assignmentRecord.attachment) {
      await deleteImageFromAzure(assignmentRecord.attachment);
    }

    // Delete the assignment from the database
    await assignmentRecord.destroy();

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getAllAssignments,
  getAssignmentsByAdmissionNo,
  deleteAssignment,
};
