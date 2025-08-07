const multer = require("multer");
const sharp = require("sharp");
const { parent } = require("../models");
const { uploadImageToAzure, deleteImageFromAzure } = require("../services/AzureBlobService");

// ✅ Multer Setup (inline)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."), false);
    }
  },
}).fields([
  { name: "father_image", maxCount: 1 },
  { name: "mother_image", maxCount: 1 }
]);

// ✅ GET Parent Info
exports.getParent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    res.status(200).json({ success: true, data: Parent });
  } catch (error) {
    console.error("Error fetching parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ DELETE Parent Info
exports.deleteParent = async (req, res) => {
  try {
    const { admission_no } = req.params;
    const Parent = await parent.findOne({ where: { admission_no } });

    if (!Parent) {
      return res.status(404).json({ success: false, message: "Parent info not found" });
    }

    await parent.destroy({ where: { admission_no } });
    res.status(200).json({ success: true, message: "Parent info deleted successfully" });
  } catch (error) {
    console.error("Error deleting parent info:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ UPDATE Parent Info (with Multer + Sharp + Azure + .trim comparison)
exports.updateParent = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: "Multer error: " + err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: "Upload error: " + err.message });
    }

    try {
      const { admission_no } = req.params;
      const updateFields = req.body;
      const files = req.files;

      const parentRecord = await parent.findOne({ where: { admission_no } });
      if (!parentRecord) {
        return res.status(404).json({ success: false, message: "Parent info not found" });
      }

      // ✅ Debug Logging
      console.log("📥 Request Body:", updateFields);
      console.log("📦 Existing DB Record:", parentRecord.toJSON());

      let updatedFields = {};

      // ✅ Compare and update fields (trimmed)
      const allowedFields = [
        "father_name", "mother_name", "father_contact", "mother_contact",
        "father_email", "mother_email", "address", "religion"
      ];

      for (const field of allowedFields) {
        if (
          updateFields[field] !== undefined &&
          updateFields[field].trim() !== String(parentRecord[field] || "").trim()
        ) {
          updatedFields[field] = updateFields[field].trim();
        }
      }

      // ✅ Handle Father Image
      if (files?.father_image?.[0]) {
        const fatherImage = files.father_image[0];
        if (parentRecord.father_image) {
          await deleteImageFromAzure(parentRecord.father_image);
        }

        const buffer = await sharp(fatherImage.buffer).resize(200, 200).toFormat("jpeg").toBuffer();
        const url = await uploadImageToAzure(buffer, `father_${Date.now()}_${fatherImage.originalname}`, "parent-images");
        updatedFields.father_image = url;
      }

      // ✅ Handle Mother Image
      if (files?.mother_image?.[0]) {
        const motherImage = files.mother_image[0];
        if (parentRecord.mother_image) {
          await deleteImageFromAzure(parentRecord.mother_image);
        }

        const buffer = await sharp(motherImage.buffer).resize(200, 200).toFormat("jpeg").toBuffer();
        const url = await uploadImageToAzure(buffer, `mother_${Date.now()}_${motherImage.originalname}`, "parent-images");
        updatedFields.mother_image = url;
      }

      // ✅ Final check
      console.log("📝 Fields to Update:", updatedFields);

      if (Object.keys(updatedFields).length === 0) {
        return res.status(200).json({ success: true, message: "No changes detected" });
      }

      await parentRecord.update(updatedFields);
      const updatedParent = await parent.findOne({ where: { admission_no } });

      res.status(200).json({
        success: true,
        message: "Parent info updated successfully",
        parent: updatedParent
      });

    } catch (error) {
      console.error("❌ Update Error:", error);
      res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
  });
};
