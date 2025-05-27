const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth'); // attach req.user with unique_id, role

router.post('/apply', auth(['teacher']), leaveController.applyLeave);
router.put('/review/:leaveId', auth(['principal']), leaveController.reviewLeave);
router.get('/my-leaves', auth(['teacher']), leaveController.viewMyLeaves);
router.get('/all', auth(['principal']), leaveController.viewAllLeaves);

module.exports = router;
