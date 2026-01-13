// controllers/LeaveController.js

const { hostel_leave_requests, student, user } = require("../models");

const LeaveRequests = hostel_leave_requests;
const Student = student;
const User = user;

// ---------------------------------------------
// 📌 Student: Request Leave
// ---------------------------------------------
exports.requestLeave = async (req, res) => {
  try {
    const { admission_no, reason, note, start_date, end_date, visit_address } =
      req.body;

    if (!admission_no || !reason || !start_date || !end_date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Check if student exists
    const checkStudent = await Student.findOne({ where: { admission_no } });
    if (!checkStudent) {
      return res.status(404).json({ message: "Invalid admission number" });
    }

    const leave = await LeaveRequests.create({
      admission_no,
      reason,
      note,
      start_date,
      end_date,
      visit_address,
    });

    return res.status(201).json({
      message: "Leave request submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Leave Request Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------
// 📌 Warden: Get All Leave Requests
// ---------------------------------------------
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequests.findAll({
      include: [
        {
          model: Student,
          attributes: ["name", "class", "admission_no"],
        },
      ],
      order: [["leave_id", "DESC"]],
    });

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Fetch Leaves Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------------------------------------
// 📌 Warden: Approve / Reject Leave
// ---------------------------------------------
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be either Approved or Rejected",
      });
    }

    const leave = await LeaveRequests.findOne({ where: { leave_id } });

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;
    await leave.save();

    return res.status(200).json({
      message: `Leave request ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    console.error("Leave Update Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
