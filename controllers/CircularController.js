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






