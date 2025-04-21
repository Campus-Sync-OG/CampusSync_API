const { class_section } = require('../models');

// Get all class-sections
exports.getAllClassSections = async (req, res) => {
  try {
    const sections = await class_section.findAll({
      order: [["className", "ASC"]],
    });

    res.status(200).json({ data: sections });
  } catch (error) {
    console.error("Error fetching class-sections:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
