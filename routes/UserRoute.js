const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController'); // Adjust path if necessary

// Routes
router.get('/list', userController.getAllUsers);

router.get('/list/:unique_id', userController.getUserByUniqueId);

router.post('/create', userController.createUser);

router.put('/update/:unique_id', userController.updateUser);

router.delete('/delete/:unique_id', userController.deleteUser);

module.exports = router;
