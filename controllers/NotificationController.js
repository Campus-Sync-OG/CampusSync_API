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

    if (roles.includes('general')) {
      // Send to ALL users
      recipients = await user.findAll({
        attributes: ['phone_number', 'unique_id'],
      });

      // Store notification record per user
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
      // Roles specific - handle user_id = "all" (all users of that role)
      if (user_id === 'all') {
        recipients = await user.findAll({
          where: {
            role: roles, // roles array usually has one role here
          },
          attributes: ['phone_number', 'unique_id'],
        });

        // Store notification record per user
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
        // Single user notification
        // Fetch user for phone number (optional, but recommended)
        const singleUser = await user.findOne({
          where: { unique_id: user_id },
          attributes: ['phone_number', 'unique_id'],
        });

        if (singleUser) {
          recipients.push(singleUser);
        }

        // Store one notification for the selected user
        await notification.create({
          title,
          message,
          user_id,
          class_id,
          section_id,
        });
      }
    }

    // Add manually entered phone numbers
    phone_numbers.forEach(num => {
      if (num) {
        recipients.push({ phone_number: num });
      }
    });

    // Normalize and deduplicate numbers
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

exports.getNotifications = async (req, res) => {
  try {
    const { user_id, class_id, section_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const whereClause = {
      user_id,
    };

    if (class_id) {
      whereClause.class_id = class_id;
    }

    if (section_id) {
      whereClause.section_id = section_id;
    }

    const notifications = await notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // latest first
    });

    return res.status(200).json({ data: notifications });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
};
