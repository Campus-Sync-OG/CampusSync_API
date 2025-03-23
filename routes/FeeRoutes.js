const express = require("express");
const router = express.Router();
const feeController = require("../controllers/FeeController");
const Auth = require("../middleware/authMiddleware");

// Get Fees by Admission No
 router.get("/getbyid/:admission_no",Auth.verifyToken, feeController.getFeesByAdmissionNo);

// Generate and Download Fee PDF
router.get('/download-fee/:receipt_no', feeController.downloadFeePDF);
router.get('/getfee', feeController.getAllFees);
router.delete('/:admission_no', feeController.deleteFee);

module.exports = router;