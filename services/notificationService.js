require("dotenv").config();
const twilio = require("twilio");
const { User } = require("../models");

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

class NotificationService {
  static async sendWhatsApp(to, message) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `whatsapp:${to}`,
      });
      console.log(`✅ WhatsApp message sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send WhatsApp message to ${to}:`, error);
    }
  }

  static async sendSMS(to, message) {
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });
      console.log(`✅ SMS sent to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error);
    }
  }

  static async sendNotifications({ title, message, roles = [], class_id, section_id, phone_numbers = [] }) {
    try {
      let recipients = [];

      if (phone_numbers.length > 0) {
        // Send to manually selected numbers
        recipients = await User.findAll({
          where: { phone_number: phone_numbers },
        });
      } else {
        // Build filter conditionally
        const whereClause = {};
        if (roles.length > 0) whereClause.role = roles;
        if (class_id) whereClause.class_id = class_id;
        if (section_id) whereClause.section_id = section_id;

        recipients = await User.findAll({ where: whereClause });
      }

      for (const recipient of recipients) {
        const rawPhone = recipient.phone_number?.toString();
        if (!rawPhone) continue;

        const formattedNumber = rawPhone.startsWith("+") ? rawPhone : `+91${rawPhone}`;
        const fullMessage = `${title}: ${message}`;

        await this.sendWhatsApp(formattedNumber, fullMessage);
        await this.sendSMS(formattedNumber, fullMessage);
      }
    } catch (error) {
      console.error("❌ Error sending notifications:", error);
    }
  }
}

module.exports = NotificationService;
