const { announcement, user } = require("../models");


// 📌 Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const Announcements = await announcement.findAll({ order: [["date", "DESC"]] });
    res.status(200).json({ success: true, Announcements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Get a single announcement by ID
exports.getAnnouncementByTitle = async (req, res) => {
  try {
    const { title } = req.params; // Get title from request params
    const Announcement = await announcement.findOne({ where: { title } });

    if (!Announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, Announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 📌 Update an announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, message, status } = req.body;

    const Announcement = await announcement.findByPk(id);
    if (!Announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    await announcement.update(
      { title, date, message, status },
      { where: { id: id } } // Ensure `announcementId` is defined
    );
    res.status(200).json({ success: true, message: "Announcement updated successfully!", announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📌 Delete an announcement
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const Announcement = await announcement.findByPk(id);
    if (!Announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    await Announcement.destroy();
    res.status(200).json({ success: true, message: "Announcement deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
