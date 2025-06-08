const express = require('express');
const router = express.Router();
const driverController = require('../controllers/DriverController');

router.get('/getall', driverController.getAllDrivers);
router.post('/add', driverController.createDriver); // <-- Add this

module.exports = router;
