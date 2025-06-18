const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

router.post('/student/send', chatController.sendMessage);
router.post('/teacher/reply', chatController.teacherReply);
router.get('/inbox/:emp_id', chatController.getTeacherInbox);
router.get('/messages/:emp_id/:admission_no', chatController.getMessages);
router.get('/student/:admission_no', chatController.getStudentMessages);

module.exports = router;
