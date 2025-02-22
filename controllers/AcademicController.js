const { academics,student } = require('../models');

// Get all academic records
const getAllAcademics = async (req, res) => {
    try {
        const academic = await academics.findAll();
        res.status(200).json(academic);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve academic records" });
    }
};

// Get academic record by admission_no
const getAcademicById = async (req, res) => {
    try {
      const { admission_no } = req.params;
      
      const academicRecords = await academics.findAll({ 
        where: { admission_no } // Fetch all academic records related to this admission_no
      });
  
      if (!academicRecords || academicRecords.length === 0) {
        return res.status(404).json({ error: "No academic records found for this admission number" });
      }
  
      res.status(200).json(academicRecords);
    } catch (error) {
      console.error("Error fetching academic records:", error);
      res.status(500).json({ error: "Failed to retrieve academic records", details: error.message });
    }
  };


module.exports = { getAllAcademics, getAcademicById };



