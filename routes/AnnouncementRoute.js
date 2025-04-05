const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/AnnouncementController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Define routes

router.get("/getall", announcementController.getAllAnnouncements); // Get all announcements
router.get("/:title", announcementController.getAnnouncementByTitle); // Get announcement by ID
router.put("/:id", announcementController.updateAnnouncement); // Update announcement


router.delete("/:id", authenticateUser, authorizeRole(["admin","operator"]), announcementController.deleteAnnouncement);

module.exports = router;
