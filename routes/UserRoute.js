const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Adjust path if necessary
const authControlller = require('../controllers/authController'); // Import functions from authController
const { uploadFeesCSV, upload } = require("../controllers/CsvController");
const RefreshToken = require("../middleware/refreshtoken");
const Auth = require("../middleware/authMiddleware");

router.get('/list', Auth.verifyToken, userController.getAllUsers);

router.get('/:unique_id', Auth.verifyToken, userController.getUserByUniqueId);

router.post('/create', Auth.verifyToken, userController.createUser);

router.put('/update/:unique_id', Auth.verifyToken, userController.updateUser);

router.delete('/delete/:unique_id', Auth.verifyToken, userController.deleteUser);

router.post("/upload-fees", Auth.verifyToken, upload.single("file"), uploadFeesCSV);
router.post("/addfee", Auth.verifyToken, userController.addFee);
router.get('/profile', (req, res) => {
  // Your existing logic for profile route
  res.send("User profile data here");
});


router.post('/send-otp', authControlller.sendOTP);  // Use the sendOTP function from authController


router.post('/verify-otp', authControlller.verifyOTP);
router.post("/token/refresh", RefreshToken.refreshToken);


module.exports = router;
