const redisClient = require('../config/redisClient');
const { student, teacher, user, teacher_class_sections } = require('../models');

// ✅ Helper: find class teacher for a student by admission_no
const getClassTeacherForStudent = async (admission_no) => {
  const studentRecord = await student.findOne({ where: { admission_no } });
  if (!studentRecord) throw new Error('Student not found');

  // Use correct field names from student table
  const { class: className, section: sectionName } = studentRecord;

  const teacherRecord = await teacher.findOne({
    include: [{
      model: teacher_class_sections,
      attributes: ['class_name', 'section_name', 'teacher_role'],
      where: {
        class_name: className,
        section_name: sectionName,
        teacher_role: 'classTeacher',
      },
    }],
  });

  if (!teacherRecord) throw new Error('Class teacher not found');

  return { teacher: teacherRecord, student: studentRecord };
};


// ✅ Student sends message to class teacher
exports.sendMessage = async (req, res) => {
  const { admission_no, message } = req.body;

  try {
    const { teacher } = await getClassTeacherForStudent(admission_no);

    const chatKey = `chat:${admission_no}:${teacher.emp_id}`;
    const chatData = {
      from: 'student',
      to: teacher.emp_id,
      message,
      timestamp: new Date().toISOString(),
    };

    await redisClient.rPush(chatKey, JSON.stringify(chatData));
    await redisClient.expire(chatKey, 3600);

    await redisClient.sAdd(`inbox:${teacher.emp_id}`, admission_no);

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
        where: { teacher_role: 'classTeacher' },
      },
    });

    if (!teacherRecord) throw new Error('Teacher not found or not class teacher');

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

// Get list of students who have messaged this teacher
exports.getTeacherInbox = async (req, res) => {
  const { emp_id } = req.params;

  try {
    const admissionNumbers = await redisClient.sMembers(`inbox:${emp_id}`);
    res.json({ students: admissionNumbers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get chat history between a student and teacher
exports.getMessages = async (req, res) => {
  const { emp_id, admission_no } = req.params;

  try {
    const chatKey = `chat:${admission_no}:${emp_id}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    const parsedMessages = messages.map((m) => JSON.parse(m));
    res.json({ chat: parsedMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Student gets chat history with class teacher
exports.getStudentMessages = async (req, res) => {
  const { admission_no } = req.params;

  try {
    const { teacher } = await getClassTeacherForStudent(admission_no);

    const chatKey = `chat:${admission_no}:${teacher.emp_id}`;
    const messages = await redisClient.lRange(chatKey, 0, -1);
    const parsedMessages = messages.map((m) => JSON.parse(m));

    res.json({ chat: parsedMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
