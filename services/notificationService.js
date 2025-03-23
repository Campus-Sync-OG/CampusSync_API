require("dotenv").config();
const twilio = require("twilio");
const { user } = require("../models");

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class NotificationService {
  // Function to send SMS notifications
  static async sendSMS(notification_type, title, message) {
    try {
      let recipients = [];

      if (["Fee Update", "Academic Update"].includes(notification_type)) {
        // Fetch only students for Fee Reminders & Academic Updates
        recipients = await user.findAll({ where: { role: "student" }, attributes: ["phone_number"] });
      } else if (notification_type === "Leave Update") {
        // Fetch all users for Leave Updates
        recipients = await user.findAll({ attributes: ["phone_number"] });
      }

      const recipientNumbers = recipients
      .map(user => user.phone_number)
      .filter(Boolean) // Remove null values
      .map(phone_number => phone_number.startsWith("+91") ? phone_number : `+91${phone_number}`); // Ensure +91 is prefixed

      for (const number of recipientNumbers) {
        await twilioClient.messages.create({
          body: `${title}: ${message}`,
          messagingServiceSid: process.env.TWILIO_MESSAGE_SERVICE_SID,
          to: number, // Send SMS to each student
        });
        console.log(`✅ SMS sent to ${number}`);
      }
    } catch (error) {
      console.error("❌ Twilio SMS Error:", error);
    }
  }

  //Function to send push notifications
  static async sendPushNotification(notification_type, title, message) {
    try {
      const recipients = await User.findAll({ attributes: ["id"] }); // Push to all users
      const pushRecipientIds = recipients.map(user => user.id);
      
      console.log("✅ Push notification sent to:", pushRecipientIds, { title, message });

      // Emit event to WebSocket for real-time push notifications
      global.io.emit("new_notification", { title, message, notification_type });

    } catch (error) {
      console.error("❌ Push Notification Error:", error);
    }
  }
}

module.exports = NotificationService;
