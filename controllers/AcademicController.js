const {student} = require('../models');
const {teacher}= require('../models');
const {academics} = require('../models');

// Helper function to evaluate grade based on marks
const evaluateGrade = (marks_obtained, total_marks) => {
  const percentage = (marks_obtained / total_marks) * 100;

  if (percentage >= 90) {
    return 'A+';
  } else if (percentage >= 80) {
    return 'A';
  } else if (percentage >= 70) {
    return 'B+';
  } else if (percentage >= 60) {
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
    const { 
      admission_no, 
      emp_id, 
      teacher_name, 
      subject, 
      class_grade, 
      term_semester, 
      academic_year, 
      marks_obtained, 
      total_marks, 
      exam_date 
    } = req.body;

    if (!marks_obtained || !total_marks) {
      return res.status(400).json({ message: 'Marks obtained and Total Marks are required.' });
    }

    // Automatically calculate grade based on marks obtained and total marks
    const grade = evaluateGrade(marks_obtained, total_marks);

    const newAcademicRecord = await academics.create({
      admission_no,
      emp_id,
      teacher_name,
      subject,
      class_grade,
      term_semester,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date,
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
    const academicRecords = await academics.findAll({
      include: [
        { model: student, attributes: ['admission_no', 'student_name'] },
        { model: teacher, attributes: ['emp_id', 'emp_name'] },
      ],
    });
    return res.status(200).json(academicRecords);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching academic records.', error: error.message });
  }
};

// Read a single academic record by admission_no
exports.getAcademicRecordByAdmissionNo = async (req, res) => {
  const { admission_no } = req.params;
  try {
    const academicRecord = await Academics.findOne({
      where: { admission_no },
      include: [
        { model: student, attributes: ['admission_no', 'student_name'] },
        { model: teacher, attributes: ['emp_id', 'emp_name'] },
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

// Update an academic record by admission_no
exports.updateAcademicRecord = async (req, res) => {
  const { admission_no } = req.params;
  const { 
    emp_id, 
    teacher_name, 
    subject, 
    class_grade, 
    term_semester, 
    academic_year, 
    marks_obtained, 
    total_marks, 
    exam_date 
  } = req.body;

  try {
    const academicRecord = await academics.findOne({ where: { admission_no } });

    if (!academicRecord) {
      return res.status(404).json({ message: 'Academic record not found.' });
    }

    // Automatically calculate grade based on new marks obtained and total marks
    const grade = evaluateGrade(marks_obtained, total_marks);

    await academicRecord.update({
      admission_no,
      emp_id,
      teacher_name,
      subject,
      class_grade,
      term_semester,
      academic_year,
      marks_obtained,
      total_marks,
      exam_date,
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

// Delete an academic record by admission_no
exports.deleteAcademicRecord = async (req, res) => {
  const { admission_no } = req.params;
  try {
    const academicRecord = await academics.findOne({ where: { admission_no } });

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
