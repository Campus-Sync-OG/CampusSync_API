const redisClient = require('../config/redisClient');
const { student, teacher, user, teacher_class_sections } = require('../models');

// ✅ Helper: find class teacher for a student by admission_no
const getClassTeacherForStudent = async (admission_no) => {
  const studentRecord = await student.findOne({ where: { admission_no } });
  if (!studentRecord) throw new Error('Student not found');

  // Find teacher from teacher_class_sections with role 'classTeacher'
  const teacherRecord = await teacher.findOne({
    where: {
      class_name: studentRecord.class_name,
      section_name: studentRecord.section_name,
    },
    include: {
      model: teacher_class_sections,
      where: { role: 'classTeacher' },
    },
  });

  if (!teacherRecord) throw new Error('Class teacher not found');
  return { teacher: teacherRecord, student: studentRecord };
};

// ✅ Student sends message to class teacher
exports.sendMessage = async (req, res) => {
  const { admission_no, message } = req.body;

  try {
    const { teacher, student } = await getClassTeacherForStudent(admission_no);

    const chatKey = `chat:${admission_no}:${teacher.emp_id}`;
    const chatData = {
      from: 'student',
      to: teacher.emp_id,
      message,
      timestamp: new Date().toISOString(),
    };

    await redisClient.rPush(chatKey, JSON.stringify(chatData));
    await redisClient.expire(chatKey, 3600); // 1 hour

    res.json({ success: true, message: 'Message sent to your class teacher.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Teacher replies to student
exports.teacherReply = async (req, res) => {
  const { emp_id, admission_no, message } = req.body;

  try {
    const studentRecord = await student.findOne({ where: { admission_no } });
    if (!studentRecord) throw new Error('Student not found');

    const teacherRecord = await teacher.findOne({
      where: { emp_id },
      include: {
        model: teacher_class_sections,
        where: { role: 'classTeacher' },
      },
    });

    if (!teacherRecord) throw new Error('Teacher not found or not class teacher');

    // Verify teacher's class/section matches student's
    if (
      teacherRecord.class_name !== studentRecord.class_name ||
      teacherRecord.section_name !== studentRecord.section_name
    ) {
      throw new Error('This teacher is not assigned to this student');
    }

    const chatKey = `chat:${admission_no}:${emp_id}`;
    const chatData = {
      from: 'teacher',
      to: admission_no,
      message,
      timestamp: new Date().toISOString(),
    };

    await redisClient.rPush(chatKey, JSON.stringify(chatData));
    await redisClient.expire(chatKey, 3600);

    res.json({ success: true, message: 'Reply sent to student.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Fetch chat between a student and their class teacher
exports.getChat = async (req, res) => {
  const { admission_no, emp_id } = req.params;

  try {
    const chatKey = `chat:${admission_no}:${emp_id}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    const chat = messages.map(msg => JSON.parse(msg));

    res.json({ chat });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch chat.' });
  }
};
