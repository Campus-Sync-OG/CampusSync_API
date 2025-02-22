const express = require("express");
const router = express.Router();
const feeController = require("../controllers/FeeController");

// Get Fees by Admission No
router.get("/:admission_no", feeController.getFeesByAdmissionNo);

// Generate and Download Fee PDF
router.get('/download-fee/:receipt_no', feeController.downloadFeePDF);
module.exports = router;