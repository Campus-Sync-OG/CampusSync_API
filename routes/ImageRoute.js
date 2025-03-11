const express = require('express');
const { uploadImage, deleteImage, upload } = require('../controllers/ImageController');

const router = express.Router();

// Upload an image
router.post('/upload', upload.single('image'), uploadImage);

// Delete an image
router.delete('/delete', deleteImage);

module.exports = router;
