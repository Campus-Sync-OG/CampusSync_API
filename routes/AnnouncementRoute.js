const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/AnnouncementController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Define routes

router.get("/getall", announcementController.getAllAnnouncements); // Get all announcements
router.get("/:id", announcementController.getAnnouncementByTitle); // Get announcement by ID
router.put("/:id", announcementController.updateAnnouncement); // Update announcement

router.post(
    "/add",
    authenticateUser,
    authorizeRole(["principal"]),
    announcementController.createAnnouncement
  );
router.delete(
    "/:id",
    authenticateUser,
    authorizeRole(["principal"]),
    announcementController.deleteAnnouncement
  );
module.exports = router;
