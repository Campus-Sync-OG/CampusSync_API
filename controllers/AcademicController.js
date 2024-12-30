const Academic = require('../models/academics'); // Ensure this matches your file structure
const Student = require('../models/student'); // Ensure this matches your file structure

// Create an academic record
const createAcademic = async (req, res) => {
  try {
    const { student_id, subject, marks_obtain, total_marks, grade, term, examdate } = req.body;

    // Check if student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
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
      examdate,
    });

    res.status(201).json({ message: 'Academic record created successfully', academicRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error creating academic record', error });
  }
};

// Get all academic records for a specific student
const getStudentAcademics = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Fetch academic records for the student
    const academicRecords = await Academic.findAll({
      where: { student_id },
      include: {
        model: Student,
        attributes: ['name', 'roll_no', 'class', 'section'],
      },
    });

    if (academicRecords.length === 0) {
      return res.status(404).json({ message: 'No academic records found for this student' });
    }

    res.status(200).json({ message: 'Academic records retrieved successfully', academicRecords });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching academic records', error });
  }
};

// Update an academic record
const updateAcademic = async (req, res) => {
  try {
    const { academicId } = req.params;
    const { marks_obtain, total_marks, grade, term, examdate } = req.body;

    // Find the academic record
    const academicRecord = await Academic.findByPk(academicId);
    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    // Update the record fields
    academicRecord.marks_obtain = marks_obtain || academicRecord.marks_obtain;
    academicRecord.total_marks = total_marks || academicRecord.total_marks;
    academicRecord.grade = grade || academicRecord.grade;
    academicRecord.term = term || academicRecord.term;
    academicRecord.examdate = examdate || academicRecord.examdate;

    await academicRecord.save();

    res.status(200).json({ message: 'Academic record updated successfully', academicRecord });
  } catch (error) {
    res.status(500).json({ message: 'Error updating academic record', error });
  }
};

// Delete an academic record
const deleteAcademic = async (req, res) => {
  try {
    const { academicId } = req.params;

    // Find and delete the academic record
    const academicRecord = await Academic.findByPk(academicId);
    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found' });
    }

    await academicRecord.destroy();

    res.status(200).json({ message: 'Academic record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting academic record', error });
  }
};

module.exports = {
  createAcademic,
  getStudentAcademics,
  updateAcademic,
  deleteAcademic,
};
