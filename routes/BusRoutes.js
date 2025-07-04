const express = require('express');
const router = express.Router();
const busController = require('../controllers/BusController');

router.get('/getbus', busController.getAllBuses);
router.get('/getbyid/:id', busController.getBusDetails);
router.post('/addbus', busController.createBus); // <-- Add this line

module.exports = router;
