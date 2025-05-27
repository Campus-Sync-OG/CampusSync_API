const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const Auth = require("../middleware/authMiddleware");// attach req.user with unique_id, role

router.post('/apply', Auth.verifyToken, leaveController.applyLeave);
router.put('/review/:id', Auth.verifyToken, leaveController.reviewLeave);
router.get('/my-leaves', Auth.verifyToken, leaveController.viewMyLeaves);
router.get('/all', Auth.verifyToken, leaveController.viewAllLeaves);

module.exports = router;
