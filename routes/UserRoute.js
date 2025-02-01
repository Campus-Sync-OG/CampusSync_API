const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Adjust path if necessary
const { sendOTP, verifyOTP } = require('../controllers/authController'); // Import functions from authController

// Routes
router.get('/list', userController.getAllUsers);

router.get('/list/:unique_id', userController.getUserByUniqueId);

router.post('/create', userController.createUser);

router.put('/update/:unique_id', userController.updateUser);

router.delete('/delete/:unique_id', userController.deleteUser);
router.get('/profile', (req, res) => {
    // Your existing logic for profile route
    res.send("User profile data here");
  });
  
  // Route for sending OTP
  router.post('/send-otp', sendOTP);  // Use the sendOTP function from authController
  
  // Route for verifying OTP
  router.post('/verify-otp', verifyOTP);  // Use the verifyOTP function from authController
  
module.exports = router;
