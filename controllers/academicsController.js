const { Academics, Student, Teacher } = require('../models'); // Import models
const sequelize = require('../config/sequelize'); // Sequelize instance

// Helper function to evaluate grade based on marks
const evaluateGrade = (marks_obtained, total_Marks) => {
  const percentage = (marks_obtained / total_Marks) * 100;

  if (percentage >= 90) {
    return 'A';
  } else if (percentage >= 75) {
    return 'B';
  } else if (percentage >= 50) {
    return 'C';
  } else {
    return 'F';
  }
};

// Create new academic record
exports.createAcademicRecord = async (req, res) => {
  try {
    const { student_id, teacher_id, marks_obtained, total_marks } = req.body;

    if (!marks_obtained || !total_marks) {
      return res.status(400).json({ message: 'Marks and Total Marks are required.' });
    }

    // Automatically calculate grade based on marks
    const grade = evaluateGrade(marks_obtained, total_marks);

    const newAcademicRecord = await Academics.create({
      student_id,
      teacher_id,
      marks_obtained,
      total_marks,
      grade,
    });

    return res.status(201).json({
      message: 'Academic record created successfully!',
      academicRecord: newAcademicRecord,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating academic record.', error: error.message });
  }
};

// Read all academic records
exports.getAllAcademicRecords = async (req, res) => {
  try {
    const academicRecords = await Academics.findAll({
      include: [
        { model: Student, attributes: ['id', 'student_name'] },
        { model: Teacher, attributes: ['id', 'emp_name']},
      ],
    });
    return res.status(200).json(academicRecords);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching academic records.', error: error.message });
  }
};

// Read a single academic record by ID
exports.getAcademicRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const academicRecord = await Academics.findOne({
      where: { id },
      include: [
        { model: Student, attributes: ['id', 'student_name'] },
        { model: Teacher, attributes: ['id', 'emp_name'] },
      ],
    });

    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found.' });
    }

    return res.status(200).json(academicRecord);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching academic record.', error: error.message });
  }
};

// Update an academic record by ID
exports.updateAcademicRecord = async (req, res) => {
  const { id } = req.params;
  const { student_id, teacher_id, marks_obtained, total_marks } = req.body;

  try {
    const academicRecord = await Academics.findOne({ where: { id } });

    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found.' });
    }

    // Automatically calculate grade based on new marks
    const grade = evaluateGrade(marks, total_marks);

    await academicRecord.update({
      student_id,
      teacher_id,
      marks_obtained,
      total_marks,
      grade,
    });

    return res.status(200).json({
      message: 'Academic record updated successfully!',
      academicRecord,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating academic record.', error: error.message });
  }
};

// Delete an academic record by ID
exports.deleteAcademicRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const academicRecord = await Academics.findOne({ where: { id } });

    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found.' });
    }

    await academicRecord.destroy();

    return res.status(200).json({ message: 'Academic record deleted successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting academic record.', error: error.message });
  }
};
