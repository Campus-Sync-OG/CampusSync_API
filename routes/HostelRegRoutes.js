const express = require("express");
const router = express.Router();
const hostelRegController = require("../controllers/hostelRegistration.controller");

router.post("/apply", hostelRegController.applyHostel);
router.get("/pending", hostelRegController.getPendingApplications);
router.post("/approve", hostelRegController.approveAndAssignRoom);

module.exports = router;
