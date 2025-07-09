const {student,circular} = require("../models");
const { Op } = require("sequelize");

const { sequelize } = require("../models");

exports.getTeacherCirculars = async (req, res) => {
  try {
    const emp_id = req.user?.unique_id;

    if (!emp_id) {
      return res.status(401).json({ error: "Unauthorized: emp_id missing from token" });
    }

    const [results] = await sequelize.query(`
      SELECT DISTINCT ON (date, headline, class_name, section)
        id, date, headline, note, attachment_url, class_name, section, emp_id
      FROM circular
      WHERE emp_id = :emp_id
      ORDER BY date DESC, headline, class_name, section, id DESC
    `, {
      replacements: { emp_id },
    });

    return res.status(200).json({
      message: "Fetched teacher's distinct circulars",
      data: results,
    });

  } catch (error) {
    console.error("Fetch Teacher Circulars Error:", error);
    return res.status(500).json({
      error: "Failed to fetch circulars",
      details: error.message,
    });
  }
};

exports.deleteCircular = async (req, res) => {
  try {
    const emp_id = req.user?.unique_id;
    const { id } = req.params;

    if (!emp_id) {
      return res.status(401).json({ error: "Unauthorized: emp_id missing from token" });
    }

    if (!id) {
      return res.status(400).json({ error: "Circular ID is required" });
    }

    // 🔍 Step 1: Get the circular to extract common fields
    const [result] = await sequelize.query(`
      SELECT headline, date, class_name, section
      FROM circular
      WHERE id = :id AND emp_id = :emp_id
      LIMIT 1
    `, {
      replacements: { id, emp_id },
    });

    if (result.length === 0) {
      return res.status(404).json({ error: "Circular not found or access denied" });
    }

    const { headline, date, class_name, section } = result[0];

    // 🗑️ Step 2: Delete all circulars with same class/section/date/headline
    await sequelize.query(`
      DELETE FROM circular
      WHERE headline = :headline
        AND date = :date
        AND class_name = :class_name
        AND section = :section
        AND emp_id = :emp_id
    `, {
      replacements: { headline, date, class_name, section, emp_id },
    });

    return res.status(200).json({ message: "Circular deleted successfully" });

  } catch (error) {
    console.error("Delete Circular Error:", error);
    return res.status(500).json({
      error: "Failed to delete circular",
      details: error.message,
    });
  }
};










