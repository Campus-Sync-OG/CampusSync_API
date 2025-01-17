const express = require('express');
const userController = require('../controllers/UserController');

const router = express.Router();

router.post('/create', userController.createUser); // Create a new user

router.get('/', userController.getAllUsers); // Get all users

router.get('/:id', userController.getUserById); // Get a user by unique_id

router.put('/:id', userController.updateUser); // Update a user by unique_id

router.delete('/delete/:id', userController.deleteUser); // Delete a user by unique_id

module.exports = router;
