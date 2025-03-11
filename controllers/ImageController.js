const multer = require("multer");
const { uploadImageToAzure, deleteImageFromAzure } = require("../services/azureBlobService");

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Image Controller
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageBuffer = req.file.buffer;
    const imageName = req.file.originalname;
    const type = req.body.type || "general"; // Default folder type if not provided

    const imageUrl = await uploadImageToAzure(imageBuffer, imageName, type);

    return res.status(201).json({ message: "Image uploaded successfully", imageUrl });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};

// Delete Image Controller
const deleteImage = async (req, res) => {
  try {
    const { blobUrl } = req.body;

    if (!blobUrl) {
      return res.status(400).json({ message: "Blob URL is required" });
    }

    await deleteImageFromAzure(blobUrl);

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Image deletion failed", error: error.message });
  }
};

// Export functions
module.exports = { uploadImage, deleteImage, upload };
