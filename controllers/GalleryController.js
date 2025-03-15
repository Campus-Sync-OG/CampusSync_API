const { getBlobsFromContainer } = require("../services/AzureBlobService");

// Controller to get only gallery images/videos
exports.getGalleryImages = async (req, res) => {
  try {
    const allBlobs = await getBlobsFromContainer();

    // Filter blobs where metadata.category is "gallery"
    const galleryFiles = allBlobs.filter(blob => blob.metadata.category === "gallery");

    res.status(200).json({
      success: true,
      gallery: galleryFiles,
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    res.status(500).json({ success: false, message: "Error fetching gallery images" });
  }
};
