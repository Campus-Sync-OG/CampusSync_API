const express = require("express");
const router = express.Router();
const feeController = require("../controllers/FeeController");
const Auth = require("../middleware/authMiddleware");

// Get Fees by Admission No
router.get("/:admission_no", Auth.verifyToken, feeController.getFeesByAdmissionNo);

// Generate and Download Fee PDF
router.get('/download-fee/:receipt_no', Auth.verifyToken, feeController.downloadFeePDF);
module.exports = router;