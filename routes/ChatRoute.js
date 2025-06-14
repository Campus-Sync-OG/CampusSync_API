const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

// Student sends a message to class teacher
router.post('/student/send', chatController.sendMessage);

// Teacher replies to student
router.post('/teacher/reply', chatController.teacherReply);

// Get chat between student and teacher (common for both)
router.get('/chatbot/:admission_no/:emp_id', chatController.getChat);

module.exports = router;
