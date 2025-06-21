const express = require("express");
const NotificationController = require("../controllers/NotificationController");
const Auth = require("../middleware/authMiddleware");
const {  authorizeRole } = require("../middleware/authMiddleware");


const router = express.Router();

// Allow only Teachers and Management to send notifications
router.post( "/postnot", Auth.verifyToken,authorizeRole(["teacher", "principal","admin"]),NotificationController.createNotification );
router.get( "/getnot", Auth.verifyToken,NotificationController.getNotifications );


module.exports = router;
