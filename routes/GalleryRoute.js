const express = require("express");
const router = express.Router();
const galleryController= require('../controllers/GalleryController');

// Route to get gallery images
router.get("/gallery", galleryController.getGalleryImages);

module.exports = router;
