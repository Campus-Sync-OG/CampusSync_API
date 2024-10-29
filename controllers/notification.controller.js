require('dotenv').config();
const twilio = require('twilio');
const User = require('../models/User'); // Assuming users are stored in a User model

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Send notifications (WhatsApp and SMS)
exports.sendNotification = async (req, res) => {
  try {
    const { eventName, date, details, collegeName  } = req.body;
    const users = await User.findAll(); // Fetch all users (or filter based on criteria if needed)

    // Notify each user
    const notifications = users.map(async (user) => {
        const personalizedMessage = `Hello ${user.username}, greetings from ${collegeName}. This is to inform you that there is an event, "${eventName}", on ${date}. Details: ${details}.`;
        const phoneNumber = user.phoneNumber; // Assuming phoneNumber field in User model

      // Send SMS
      await client.messages.create({
        body: personalizedMessage,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: phoneNumber,
      });

      // Send WhatsApp message
      await client.messages.create({
        body: personalizedMessage,
        from: process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio WhatsApp-enabled number
        to: `whatsapp:${phoneNumber}`,
      });
    });

    await Promise.all(notifications); // Wait for all notifications to complete
    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
