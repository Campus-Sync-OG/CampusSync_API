const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const userController = require('../controllers/UserController'); 

// Route to register a new user
router.post('/register', userController.createUser); // Register route uses the userController

// Route for user login
router.post('/login', authController.login); // Login route uses the authController

// Protected route to get user info (example)
router.get('/user', authController.authenticate, (req, res) => {
  res.status(200).json({
    message: 'Authenticated',
    user: req.user, // This will contain the decoded token payload
  });
});

// Admin-only route (example)
router.get('/admin', authController.authenticate, authController.isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

// If you want to add more routes for user management, you can create a separate controller for them
// For example, a route to get all users, update user, delete user, etc.

module.exports = router;
