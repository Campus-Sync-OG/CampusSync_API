const express = require("express");
const router = express.Router();
const LeaveController = require("../controllers/HostelLeavesController");

// Student
router.post("/request", LeaveController.requestLeave);

// Warden
router.get("/all", LeaveController.getAllLeaveRequests);
router.put("/update/:leave_id", LeaveController.updateLeaveStatus);

// Optional student history
router.get("/student/:admission_no", LeaveController.getLeaveHistory);

module.exports = router;
