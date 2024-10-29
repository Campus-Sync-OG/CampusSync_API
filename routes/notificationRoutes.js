const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Route to send notifications
router.post('/notify', notificationController.sendNotification);

module.exports = router;
