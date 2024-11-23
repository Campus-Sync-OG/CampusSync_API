const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.loginWithPhoneNumber);
router.post('/verify', authController.verifyToken);

module.exports = router;
