const { subject } = require('../models'); // Adjust the path if necessary

// Create a new subject
exports.createSubject = async (req, res) => {
    try {
        const { subject_name } = req.body;
        if (!subject_name) {
            return res.status(400).json({ message: "Subject name is required" });
        }

        // Create the subject
        const newSubject = await subject.create({ subject_name });
        return res.status(201).json({
            message: "Subject created successfully",
            subject: newSubject,
        });
    } catch (error) {
        console.error("Error creating subject:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
    try {
        const subjects = await subject.findAll();
        if (!subjects.length) {
            return res.status(404).json({ message: "No subjects found" });
        }
        return res.status(200).json({ subjects });
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get subject by id
exports.getSubjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const foundSubject = await subject.findByPk(id);
        if (!foundSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        return res.status(200).json({ subject: foundSubject });
    } catch (error) {
        console.error("Error fetching subject:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const { id } = req.params;
        const foundSubject = await subject.findByPk(id);
        if (!foundSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        await foundSubject.destroy();
        return res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        console.error("Error deleting subject:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
