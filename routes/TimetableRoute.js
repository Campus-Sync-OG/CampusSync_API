const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/TimetableController');

// Route to get timetable for a specific class and section
//router.get('/:className/:section_name', timetableController.getTimetable);

// Route to update specific slots in the timetable
router.put('/update', timetableController.updateTimetable);

router.get('/student/:admission_no', timetableController.getTimetableByAdmissionNo);

router.get('/class-section', timetableController.getTimetableByClassSection);


module.exports = router;
