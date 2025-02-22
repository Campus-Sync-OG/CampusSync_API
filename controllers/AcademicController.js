const { academics } = require('../models');

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

  const deleteAcademicById = async (req, res) => {
    try {
        const { admission_no } = req.params;
        const deleted = await academics.destroy({ where: { admission_no } });

        if (!deleted) {
            return res.status(404).json({ error: "No academic records found for this admission number" });
        }

        res.status(200).json({ message: "Academic records deleted successfully" });
    } catch (error) {
        console.error("Error deleting academic record:", error);
        res.status(500).json({ error: "Failed to delete academic record", details: error.message });
    }
};

module.exports = { getAllAcademics, getAcademicById, deleteAcademicById };





