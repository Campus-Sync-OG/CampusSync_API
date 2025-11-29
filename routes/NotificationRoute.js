const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const Auth = require("../middleware/authMiddleware");
const {  authorizeRole } = require("../middleware/authMiddleware");


const router = express.Router();

// Allow only Teachers and Management to send notifications
router.post( "/postnot", Auth.verifyToken,authorizeRole(["teacher", "principal","admin"]),NotificationController.createNotification );
router.get( "/getnot", Auth.verifyToken,NotificationController.getNotifications );
router.post("/mark-read-all/:user_id", NotificationController.markAllRead);
router.post("/mark-read/:id", NotificationController.markAsRead);
router.get("/unread/:user_id", NotificationController.getUnreadCount);


module.exports = router;
