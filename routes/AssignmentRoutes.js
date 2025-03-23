const express = require('express');
const router = express.Router();
const AssignmentController = require('../controllers/AssignmentController');
const csvController = require('../controllers/CsvController');
const Auth = require("../middleware/authMiddleware");


router.get('/all',  AssignmentController.getAllAssignments);
router.get('/all/:admission_no', Auth.verifyToken, AssignmentController.getAssignmentsByAdmissionNo);
router.delete('/delete/:admission_no', Auth.verifyToken, AssignmentController.deleteAssignment);




module.exports = router;