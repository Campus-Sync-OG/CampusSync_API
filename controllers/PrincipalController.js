const { Principal } = require('../models/principal');
const Teacher = require('../models/teacher');
const Student = require('../models/student');

// Function to create a new principal
exports.createPrincipal = async (req, res) => {
  try {
    const { p_id, name, password, phone_no, email, school_name, add_teacher, add_student } = req.body;

    // Check if the principal already exists
    const user = await User.findOne({ where: { unique_id: p_id, role: 'principal' } });
    if (existingPrincipal) {
      return res.status(400).json({ message: 'Principal with this ID already exists' });
    }

    // Create a new principal record
    const principal = await Principal.create({
      p_id,
      name,
      password,
      phone_no,
      email,
      school_name,
      add_teacher,
      add_student,
    });

    res.status(201).json({ message: 'Principal created successfully', principal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to update teacher status (active/inactive)
exports.updateTeacherStatus = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { active } = req.body;

    const teacher = await Teacher.findOne({ where: { emp_id } });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.active = active; // Update the teacher status to active or inactive
    await teacher.save();

    res.status(200).json({ message: `Teacher status updated to ${active ? 'active' : 'inactive'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to update student status (active/inactive)
exports.updateStudentStatus = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const { active } = req.body;

    const student = await Student.findOne({ where: { admission_no } });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.active = active; // Update the student status to active or inactive
    await student.save();

    res.status(200).json({ message: `Student status updated to ${active ? 'active' : 'inactive'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to allow the principal to add a teacher (if permitted)
exports.addTeacher = async (req, res) => {
  try {
    const { principal_id } = req.params;
    const { add_teacher } = req.body;

    // Check if the principal exists and if they have permission to add a teacher
    const principal = await Principal.findOne({ where: { p_id: principal_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    if (!principal.add_teacher) {
      return res.status(403).json({ message: 'Principal does not have permission to add teachers' });
    }

    // Here you would add logic to create a new teacher record (for example, creating a new teacher)
    res.status(200).json({ message: 'Teacher can be added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to allow the principal to add a student (if permitted)
exports.addStudent = async (req, res) => {
  try {
    const { principal_id } = req.params;
    const { add_student } = req.body;

    // Check if the principal exists and if they have permission to add a student
    const principal = await Principal.findOne({ where: { p_id: principal_id } });
    if (!principal) {
      return res.status(404).json({ message: 'Principal not found' });
    }

    if (!principal.add_student) {
      return res.status(403).json({ message: 'Principal does not have permission to add students' });
    }

    // Here you would add logic to create a new student record (for example, creating a new student)
    res.status(200).json({ message: 'Student can be added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to get all teachers managed by the principal (you can extend this to include active/inactive)
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Function to get all students managed by the principal
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
