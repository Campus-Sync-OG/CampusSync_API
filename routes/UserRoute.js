const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

// Route to create a new user
router.post('/create', userController.createUser);

// Route to update an existing user by unique_id
router.put('/update/:unique_id', userController.updateUser);

// Route to delete a user by unique_id
router.delete('/delete/:unique_id', userController.deleteUser);

// Route to get all users
router.get('/all', userController.getAllUsers);

// Route to get a user by unique_id
router.get('/:unique_id', userController.getUserByUniqueId);

module.exports = router;
