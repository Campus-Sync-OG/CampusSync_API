const { notification, user } = require("../models");
const NotificationService = require("../services/notificationService");

class NotificationController {
  // Create a new notification
  static async createNotification(req, res) {
    try {
      const { notification_type, title, message } = req.body;
      const user_id = req.user.unique_id;

      const Notification = await notification.create({ notification_type, title, message, user_id });

      // Send notifications
      await NotificationService.sendSMS(notification_type, title, message);
      //await NotificationService.sendPushNotification(notification_type, title, message);

      return res.status(201).json({ success: true, message: "Notification created successfully", data: Notification });
    } catch (error) {
      console.error("Error creating notification:", error);
      return res.status(500).json({ success: false, message: "Failed to create notification" });
    }
  }

  // Get notifications based on user role
  static async getNotifications(req, res) {
    try {
      const role = req.user.role; // Corrected destructuring

      let notifications;
      if (role === "student") {
        // Students see only SMS-based and push notifications
        notifications = await notification.findAll({

          where: {
            notification_type: {
              [Op.in]: ["Fee Update", "Academic Update", "Leave Update", "General Announcement"]
            }
          },
          order: [["createdAt", "DESC"]]
        });
      } else {
        // Teachers & Management see all notifications
        notifications = await notification.findAll({
          order: [["createdAt", "DESC"]]
        });
      }

      return res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve notifications" });
    }
  }

  // Delete a notification by ID
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      // Check if user has the correct role
      if (req.user.role !== "teacher" && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
      }

      const Notification = await notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }

      await Notification.destroy();
      return res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      return res.status(500).json({ success: false, message: "Failed to delete notification" });
    }
  }

}

module.exports = NotificationController;
