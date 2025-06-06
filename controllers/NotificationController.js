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

    if (!title || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let recipients = [];

    // ✅ If role contains "general", send to ALL users and store all unique_ids
    if (roles.includes('general')) {
      recipients = await user.findAll({
        attributes: ['phone_number', 'unique_id'],
      });

      // Store one record per user for full audit
      for (const u of recipients) {
        await notification.create({
          title,
          message,
          user_id: u.unique_id,
          class_id,
          section_id,
        });
      }
    } else {
      // ✅ Send to selected specific roles (single or multiple)
      recipients = await user.findAll({
        where: {
          role: roles,
        },
        attributes: ['phone_number', 'unique_id'],
      });

      // Store once for initiating user
      await notification.create({
        title,
        message,
        user_id,
        class_id,
        section_id,
      });
    }

    // ✅ Add manually entered phone numbers
    phone_numbers.forEach(num => {
      if (num) {
        recipients.push({ phone_number: num });
      }
    });

    // ✅ Normalize and deduplicate numbers
    const uniqueNumbers = [
      ...new Set(
        recipients
          .map(u => u.phone_number?.toString())
          .filter(Boolean)
          .map(num => (num.startsWith('+') ? num : `+91${num}`))
      ),
    ];

    // ✅ Send notification via WhatsApp and SMS
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