const Academic = require('../models/academics');
const Student = require('../models/student');

// Create an academic record
const createAcademic = async (req, res) => {
  try {
    const { student_id, subject, marks_obtain, total_marks, grade, term, exam_date } = req.body;

    // Check if the student exists
    const studentExists = await Student.findByPk(student_id);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create the academic record
    const academicRecord = await Academic.create({
      student_id,
      subject,
      marks_obtain,
      total_marks,
      grade,
      term,
      exam_date,
    });

    return res.status(201).json({ message: 'Academic record created successfully', academicRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating academic record', error: error.message });
  }
};

// Get all academic records for a specific student
const getStudentAcademics = async (req, res) => {
  try {
    const { student_id } = req.params;

    const academicRecords = await Academic.findAll({
      where: { student_id },
      include: {
        model: Student,
        attributes: ['id', 'roll_no', 'class', 'section'],
      },
    });

    if (!academicRecords.length) {
      return res.status(404).json({ message: 'No academic records found for this student' });
    }

    return res.status(200).json({ message: 'Academic records retrieved successfully', academicRecords });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching academic records', error: error.message });
  }
};

// Update an academic record
const updateAcademic = async (req, res) => {
  try {
    const { academicId } = req.params;
    const { marks_obtain, total_marks, grade, term, exam_date } = req.body;

    const academicRecord = await Academic.findByPk(academicId);
    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    const updatedRecord = await academicRecord.update({
      marks_obtain,
      total_marks,
      grade,
      term,
      exam_date,
    });

    return res.status(200).json({ message: 'Academic record updated successfully', updatedRecord });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating academic record', error: error.message });
  }
};

// Delete an academic record
const deleteAcademic = async (req, res) => {
  try {
    const { academicId } = req.params;

    const academicRecord = await Academic.findByPk(academicId);
    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    await academicRecord.destroy();
    return res.status(200).json({ message: 'Academic record deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting academic record', error: error.message });
  }
};

module.exports = {
  createAcademic,
  getStudentAcademics,
  updateAcademic,
  deleteAcademic,
};
