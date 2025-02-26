require("dotenv").config();
const twilio = require("twilio");

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

let notifications = []; // In-memory notification storage

// Store a new notification
const addNotification = (data) => {
  notifications.push(data);
  return data;
};

// Get all notifications
const getNotifications = () => {
  return notifications;
};

// Send SMS for specific notification types
const sendSMS = (notification) => {
  const recipients = ["+919380216900"]; // Replace with real numbers

  recipients.forEach((number) => {
    twilioClient.messages
    .create({
      body: `${notification.type}: ${notification.title} - ${notification.message}`,
      messagingServiceSid: process.env.TWILIO_SERVICE_SID, // ✅ Use this instead of 'from'
      to: number,
    })
      .then((message) => console.log(`SMS sent to ${number}:`, message.sid))
      .catch((error) => console.error("Twilio Error:", error));
  });
};

module.exports = { addNotification, getNotifications, sendSMS };
