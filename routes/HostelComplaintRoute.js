const express = require("express");
const router = express.Router();
const ComplaintController = require("../controllers/HostelComplaintController");


router.post("/apply", ComplaintController.applyComplaint);
router.get("/student/:admission_no", ComplaintController.getStudentComplaints);
router.get("/all", ComplaintController.getAllComplaints);
router.put("/review/:complaint_id", ComplaintController.reviewComplaint);

module.exports = router;
