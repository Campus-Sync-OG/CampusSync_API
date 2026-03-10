const express = require("express");
const router = express.Router();
const HostelLeavesController = require("../controllers/HostelLeavesController");

// Student
router.post("/request", HostelLeavesController.requestLeave);

// Warden
router.get("/all", HostelLeavesController.getAllLeaveRequests);
router.put("/update/:leave_id", HostelLeavesController.updateLeaveStatus);

// Optional student history
router.get("/student/:admission_no", HostelLeavesController.getLeaveHistory);

module.exports = router;
