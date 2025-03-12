const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

// Allow only Teachers and Management to send notifications
router.post(
  "/postnot",
  authenticateUser,
  authorizeRole(["teacher", "Management"]),
  NotificationController.createNotification
);

// Get all notifications (accessible to all logged-in users)
router.get("/getnot", authenticateUser, NotificationController.getNotifications);

// Delete a notification (only Teachers and Management can delete)
router.delete(
  "/:id",
  authenticateUser,
  authorizeRole(["teacher", "Management"]),
  NotificationController.deleteNotification
);

module.exports = router;
