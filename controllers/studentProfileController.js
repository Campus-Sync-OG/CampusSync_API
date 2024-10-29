const StudentProfile = require("./models/StudentProfile");

exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await StudentProfile.findAll();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve student profiles" });
  }
};

exports.getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await StudentProfile.findByPk(id);
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: "Student profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve student profile" });
  }
};

exports.createProfile = async (req, res) => {
  const {
    user_id,
    student_name,
    class: studentClass,
    section,
    parent_user_id,
    admission_date,
  } = req.body;
  try {
    const newProfile = await StudentProfile.create({
      user_id,
      student_name,
      class: studentClass,
      section,
      parent_user_id,
      admission_date,
    });
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).json({ error: "Failed to create student profile" });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    student_name,
    class: studentClass,
    section,
    parent_user_id,
    admission_date,
  } = req.body;
  try {
    const profile = await StudentProfile.findByPk(id);
    if (profile) {
      await profile.update({
        user_id,
        student_name,
        class: studentClass,
        section,
        parent_user_id,
        admission_date,
      });
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: "Student profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update student profile" });
  }
};

exports.deleteProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await StudentProfile.findByPk(id);
    if (profile) {
      await profile.destroy();
      res.status(200).json({ message: "Student profile deleted successfully" });
    } else {
      res.status(404).json({ error: "Student profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student profile" });
  }
};
