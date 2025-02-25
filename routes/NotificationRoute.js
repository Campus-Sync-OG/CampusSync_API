const express = require("express");
const router = express.Router();
const { addNotification, getNotifications, sendSMS } = require("../services/notificationService");

// ✅ Get all notifications
router.get("/getNotification", (req, res) => {
  res.json({ notifications: getNotifications() });
});

// ✅ Send a new notification
router.post("/sendNotification", (req, res) => {
  try {
    const { type, title, message, recipient } = req.body;

    if (!type || !title || !message || !recipient) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save notification
    const newNotification = addNotification({ type, title, message, recipient });

    // Send SMS for selected types
    if (["General Announcement", "Event Announcement", "Academic Results"].includes(type)) {
      sendSMS(newNotification);
    }

    res.status(201).json({ message: "Notification sent successfully", notification: newNotification });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

module.exports = router;
