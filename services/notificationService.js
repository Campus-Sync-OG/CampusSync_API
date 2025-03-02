require("dotenv").config();
const twilio = require("twilio");
const { User } = require("../models");

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class NotificationService {
  // Function to send SMS notifications
  static async sendSMS(notification_type, title, message) {
    try {
      let recipients = [];
      
      if (notification_type === "Fee Reminder" || notification_type === "Academic Update") {
        recipients = await User.findAll({ where: { role: "Student" }, attributes: ["phone"] });
      } else if (notification_type === "Leave Update") {
        recipients = await User.findAll({ attributes: ["phone"] }); // All users
      }
      
      const recipientNumbers = recipients.map(user => user.phone);
      
      for (const number of recipientNumbers) {
        await twilioClient.messages.create({
          body: `${title}: ${message}`,
          messagingServiceSid: process.env.TWILIO_SERVICE_SID,
          to: "+919380216900",
        });
        console.log(`SMS sent to ${number}`);
      }
    } catch (error) {
      console.error("Twilio Error:", error);
    }
  }

  // Function to send push notifications for all notification types
  static async sendPushNotification(notification_type, title, message) {
    try {
      const recipients = await User.findAll({ attributes: ["id"] }); // Push to all users
      const pushRecipientIds = recipients.map(user => user.id);
      console.log("Push notification sent to:", pushRecipientIds, { title, message });
      // Implement actual push notification logic here
    } catch (error) {
      console.error("Push Notification Error:", error);
    }
  }
}

module.exports = NotificationService;
