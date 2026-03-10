const { hostel_complaints, student, user } = require("../models");

const Complaints = hostel_complaints;
const Student = student;
const User = user;

///////////////////////////////////////////////////////
// 📌 1️⃣ Student: Apply Complaint
///////////////////////////////////////////////////////
exports.applyComplaint = async (req, res) => {
    try {
        const {
            admission_no,
            complaint_type,
            subject,
            description,
            attachment_url,
        } = req.body;

        if (!admission_no || !complaint_type || !subject || !description) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Validate student
        const studentExists = await Student.findOne({ where: { admission_no } });
        if (!studentExists) {
            return res.status(404).json({ message: "Invalid admission number" });
        }

        const complaint = await Complaints.create({
            admission_no,
            complaint_type,
            subject,
            description,
            attachment_url,
            status: "Pending",
            created_on: new Date(),
        });

        return res.status(201).json({
            message: "Complaint submitted successfully",
            data: complaint,
        });
    } catch (error) {
        console.error("Apply Complaint Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

///////////////////////////////////////////////////////
// 📌 2️⃣ Fetch Complaints (Warden/Admin)
///////////////////////////////////////////////////////
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaints.findAll({
            include: [
                {
                    model: Student,
                    as: "student", // ✅ alias required
                    attributes: ["admission_no", "student_name", "class", "section"],
                },
            ],
            order: [["complaint_id", "DESC"]],
        });

        return res.status(200).json({
            message: "Complaints fetched successfully",
            count: complaints.length,
            data: complaints,
        });
    } catch (error) {
        console.error("Fetch Complaints Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
   
  
exports.getStudentComplaints = async (req, res) => {
    try {
        const { admission_no } = req.params;

        const complaints = await Complaints.findAll({
            where: { admission_no },
            order: [["complaint_id", "DESC"]],
            as: "student",
        });

        return res.status(200).json({
            message: "Student complaints fetched",
            data: complaints,
        });
    } catch (error) {
        console.error("Fetch Student Complaints Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


exports.reviewComplaint = async (req, res) => {
    try {
        const { complaint_id } = req.params;
        const { status, response_message, responded_by } = req.body;

        if (!["In Review", "Resolved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
            });
        }

        const complaint = await Complaints.findByPk(complaint_id);

        if (!complaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        complaint.status = status;
        complaint.response_message = response_message || null;
        complaint.responded_by = responded_by || null;
        complaint.responded_on = new Date();
        complaint.updated_on = new Date();

        await complaint.save();

        return res.status(200).json({
            message: `Complaint ${status}`,
            data: complaint,
        });
    } catch (error) {
        console.error("Review Complaint Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
