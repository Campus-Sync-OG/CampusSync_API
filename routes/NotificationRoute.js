const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const Auth = require("../middleware/authMiddleware");
const {  authorizeRole } = require("../middleware/authMiddleware");


const router = express.Router();

// Allow only Teachers and Management to send notifications
router.post( "/postnot", Auth.verifyToken,authorizeRole(["teacher", "principal","admin"]),NotificationController.createNotification);

// Get all notifications (accessible to all logged-in users)
router.get("/getnot", Auth.verifyToken, NotificationController.getNotifications);

// Delete a notification (only Teachers and Management can delete)
router.delete("/:id",Auth.verifyToken,authorizeRole(["teacher", "principal","admin"]),NotificationController.deleteNotification);

module.exports = router;
