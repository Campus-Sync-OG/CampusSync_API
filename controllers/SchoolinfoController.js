const { schoolinfo } = require('../models');

const createSchool = async (req, res) => {
  try {
    const { school_name, address, phone_number, email, website, established_year, affiliation } = req.body;

    if (!school_name || !address || !phone_number || !email) {
      return res.status(400).json({ message: "School name, address, phone number, and email are required" });
    }

    const newSchool = await schoolinfo.create({ school_name, address, phone_number, email, website, established_year, affiliation });

    return res.status(201).json({
      message: "School created successfully",
      school: newSchool,
    });
  } catch (error) {
    console.error("Error creating school:", error.message || error);
    return res.status(500).json({ message: "Internal server error", error: error.message || error });
  }
};

const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { school_name, address, phone_number, email, website, established_year, affiliation } = req.body;

    const school = await schoolinfo.findByPk(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    await school.update({ school_name, address, phone_number, email, website, established_year, affiliation });
    return res.status(200).json({ message: "School updated successfully", school });
  } catch (error) {
    console.error("Error updating school:", error);
    return res.status(500).json({ message: "Error updating school", error });
  }
};

const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;

    const school = await schoolinfo.findByPk(id);
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    return res.status(200).json({ school });
  } catch (error) {
    console.error("Error fetching school:", error);
    return res.status(500).json({ message: "Error fetching school", error });
  }
};

const getAllSchools = async (req, res) => {
  try {
    const allSchools = await schoolinfo.findAll();
    return res.status(200).json({ schools: allSchools });
  } catch (error) {
    console.error("Error fetching all schools:", error);
    return res.status(500).json({ message: "Error fetching all schools", error });
  }
};

module.exports = { createSchool, updateSchool, getSchoolById, getAllSchools };
