const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/AnnouncementController");

// Define routes
router.post("/add", announcementController.createAnnouncement); // Create announcement
router.get("/getall", announcementController.getAllAnnouncements); // Get all announcements
router.get("/:title", announcementController.getAnnouncementByTitle); // Get announcement by ID
router.put("/:id", announcementController.updateAnnouncement); // Update announcement
router.delete("/:id", announcementController.deleteAnnouncement); // Delete announcement

module.exports = router;
