const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getLocation
} = require('../controllers/LocationController');

router.post('/update', updateLocation);
router.get('/:bus_id', getLocation);

module.exports = router;
