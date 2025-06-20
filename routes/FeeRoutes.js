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

// Route to create Razorpay order
router.post('/create-order/:admission_no', feeController.createPayment);

// Route to verify payment
router.post('/verify-payment', feeController.verifyPayment);


router.post('/generate-receipt', feeController.generateReceipt);

router.post("/fee-plan", feeController.createFeePlanForClassSection);

router.get("/fee-status", feeController.getFeeStatusByClassSection);

router.post('/record-cash-payment', feeController.recordCashPayment);

router.get('/student-fee-status/:admission_no', feeController.getStudentFeeStatus);

router.get("/student-fee/:admission_no", feeController.getStudentFeeDetails);


module.exports = router;