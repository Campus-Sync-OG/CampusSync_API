const { student, student_promotion } = require('../models');

// 🟢 Promote a batch of students to next class/section
exports.promoteStudents = async (req, res) => {
  const {
    from_class,
    from_section,
    to_class,
    to_section,
    admission_no = [], // ⬅️ Only promote students in this list
  } = req.body;

  if (!from_class || !from_section || !to_class || !to_section || !admission_no.length) {
    return res.status(400).json({ error: 'Missing required fields or empty student list.' });
  }

  try {
    const studentsToPromote = await student.findAll({
      where: {
        class: from_class,
        section: from_section,
        admission_no, // Only promote selected students
      },
    });

    if (studentsToPromote.length === 0) {
      return res.status(404).json({ message: 'No matching students found to promote.' });
    }

    const updates = studentsToPromote.map(async (s) => {
      await student.update(
        { class: to_class, section: to_section },
        { where: { admission_no: s.admission_no } }
      );

      await student_promotion.create({
        admission_no: s.admission_no,
        from_class,
        from_section,
        to_class,
        to_section,
      });
    });

    await Promise.all(updates);

    res.json({
      success: true,
      message: `${studentsToPromote.length} student(s) promoted successfully.`,
    });
  } catch (err) {
    console.error('Promotion error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
