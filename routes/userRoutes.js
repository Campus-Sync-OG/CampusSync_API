const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/create', userController.createUser);
router.get('/list', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/update', userController.updateUser);
router.delete('/delete', userController.deleteUser);

module.exports = router;
