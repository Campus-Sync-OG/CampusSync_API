const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/AnnouncementController");
const {  authorizeRole } = require("../middleware/authMiddleware");

// Define routes

router.get("/getall", announcementController.getAllAnnouncements); // Get all announcements
router.get("/:title", announcementController.getAnnouncementByTitle); // Get announcement by ID
router.put("/:id", announcementController.updateAnnouncement); // Update announcement


router.delete("/:id",  authorizeRole(["admin","operator","principal"]), announcementController.deleteAnnouncement);

module.exports = router;
