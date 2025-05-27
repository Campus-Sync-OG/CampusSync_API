const { notification, user } = require('../models');
const NotificationService = require('../services/notificationService');

exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      user_id,
      roles = [],
      class_id,
      section_id,
      phone_numbers = [],
    } = req.body;

    // Validate required fields
    if (!title || !message || !user_id) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create the notification record in the database
    await notification.create({
      title,
      message,
      user_id,
      class_id,
      section_id,
    });

    let recipients = [];

    // If 'general' role selected, send to all: principal, teacher, student
    if (roles.includes('general')) {
      recipients = await user.findAll({
        where: {
          role: ['student', 'teacher', 'principal'],
        },
        attributes: ['phone_number'],
      });
    } else {
      // Otherwise, send to specific roles
      recipients = await user.findAll({
        where: {
          role: roles, // ['student'], ['teacher'], etc.
        },
        attributes: ['phone_number'],
      });
    }

    // Include additional custom numbers (optional)
    phone_numbers.forEach(num => {
      recipients.push({ phone_number: num });
    });

    // Filter valid numbers and format
    const uniqueNumbers = [
      ...new Set(
        recipients
          .map(u => u.phone_number?.toString())
          .filter(Boolean)
          .map(num => (num.startsWith('+') ? num : `+91${num}`))
      ),
    ];

    // Send notifications via WhatsApp and SMS
    for (const number of uniqueNumbers) {
      await NotificationService.sendWhatsApp(number, `${title}: ${message}`);
      await NotificationService.sendSMS(number, `${title}: ${message}`);
    }

    return res.status(200).json({ message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error in createNotification:', error);
    return res.status(500).json({ error: 'Failed to send notification.' });
  }
};
