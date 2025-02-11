const { examformat } = require("../models");

exports.createExamFormat = async (req, res) => {
  try {
    const { exam_name } = req.body;
    if (!exam_name) {
      return res.status(400).json({ message: "Exam name is required" });
    }

    const newExam = await examformat.create({ exam_name });
    res.status(201).json({ message: "Exam format created successfully", newExam });

  } catch (error) {
    console.error("Error creating exam format:", error);
    res.status(500).json({
      message: "Error creating exam format",
      error: error.message || error,
    });
  }
};


// Get all exam formats
exports.getExamFormats = async (req, res) => {
  try {
    const exams = await examformat.findAll();
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exam formats", error });
  }
};

// Get a single exam format by ID
exports.getExamFormatById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await examformat.findByPk(id);
    if (!exam) {
      return res.status(404).json({ message: "Exam format not found" });
    }
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ message: "Error fetching exam format", error });
  }
};


