const router = require("express").Router();
const ComplaintController = require("../controllers/ComplaintsController");

router.post("/create", ComplaintController.createComplaint);
router.get("/all", ComplaintController.getAllComplaints);
router.get("/student/:admission_no", ComplaintController.getStudentComplaints);
router.put("/update-status", ComplaintController.updateComplaintStatus);

module.exports = router;
