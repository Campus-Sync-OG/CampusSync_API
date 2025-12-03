const { hostel_complaints } = require("../models");


// ----------------------------------------
// ✔ Create Complaint
// ----------------------------------------
exports.createComplaint = async (req, res) => {
  try {
    const {
      admission_no,
      complaint_type,
      subject,
      description,
      attachment_url
    } = req.body;

    if (!admission_no || !complaint_type || !subject || !description) {
      return res.status(400).json({
        message: "admission_no, complaint_type, subject, description are required"
      });
    }

    const validTypes = [
      "Hostel",
      "Food",
      "Cleanliness",
      "Discipline",
      "Maintenance",
      "Other",
    ];

    if (!validTypes.includes(complaint_type)) {
      return res.status(400).json({
        message: "Invalid complaint type",
      });
    }

    const complaint = await hostel_complaints.create({
      admission_no,
      complaint_type,
      subject,
      description,
      attachment_url: attachment_url || null,
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      data: complaint,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};



// ----------------------------------------
// ✔ Get All Complaints
// ----------------------------------------
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await hostel_complaints.findAll({
      order: [["created_on", "DESC"]],
    });

    return res.status(200).json({
      message: "Complaints fetched successfully",
      data: complaints,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};



// ----------------------------------------
// ✔ Get Complaints by Student (admission_no)
// ----------------------------------------
exports.getStudentComplaints = async (req, res) => {
  try {
    const { admission_no } = req.params;

    const complaints = await hostel_complaints.findAll({
      where: { admission_no },
      order: [["created_on", "DESC"]],
    });

    return res.status(200).json({
      message: "Student complaints fetched successfully",
      data: complaints,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};



// ----------------------------------------
// ✔ Update Complaint Status + Admin Response
// ----------------------------------------
exports.updateComplaintStatus = async (req, res) => {
  try {
    const {
      complaint_id,
      status,
      response_message,
      responded_by,
    } = req.body;

    if (!complaint_id || !status) {
      return res.status(400).json({
        message: "complaint_id and status are required",
      });
    }

    const validStatus = ["Pending", "In Review", "Resolved", "Rejected"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const complaint = await hostel_complaints.findOne({
      where: { complaint_id },
    });

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    await hostel_complaints.update(
      {
        status,
        response_message: response_message || null,
        responded_by: responded_by || null,
        responded_on: new Date(),
        updated_on: new Date(),
      },
      { where: { complaint_id } }
    );

    return res.status(200).json({
      message: "Complaint status updated successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
