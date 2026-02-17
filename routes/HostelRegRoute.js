const express = require("express");
const router = express.Router();
const hostelRegController = require("../controllers/HostelRegisterController");

router.post("/apply", hostelRegController.applyHostel);
router.get("/pending", hostelRegController.getPendingApplications);
router.post("/approve", hostelRegController.approveAndAssignRoom);
router.get("/rooms", hostelRegController.getHostelRooms);
router.post("/principal-approve", hostelRegController.principalApproveHostel);
router.get("/application", hostelRegController.getApprovedApplicationsForWarden);
router.get("/students", hostelRegController.getHostelStudents);

module.exports = router;
