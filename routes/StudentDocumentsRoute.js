const express = require('express');
const router = express.Router();
const controller = require('../controllers/studentDocumentsController');

// POST
router.post('/create', controller.createStudentDocument);

// GET
router.get('/getbyid/:admission_no', controller.getStudentDocumentById);
router.get('/all', controller.getAllStudentDocuments);

// PUT
router.put('/update/:admission_no', controller.updateStudentDocument);

module.exports = router;
