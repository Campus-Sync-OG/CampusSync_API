const { calendar } = require("../models");
const colorMap = {
  "Holiday": "#FFD700",
  "Exam": "#1E90FF",
  "Meeting": "#FF69B4",
  "Function": "black",
  "Other": "#A9A9A9"
};

exports.getAllEvents = async (req, res) => {
  try {
    const role = req.query.role?.toLowerCase(); // Normalize incoming role to lowercase
    let events = await calendar.findAll();

    if (role) {
      events = events.filter(event => {
        let visibleTo = event.visibleTo;

        if (!visibleTo) return true; // Show to everyone if no restriction

        try {
          // If it's a stringified JSON array like '["Student"]'
          if (typeof visibleTo === 'string') {
            try {
              visibleTo = JSON.parse(visibleTo); // → ['Student', 'Parent']
            } catch {
              // Or fallback for comma-separated like "Student,Teacher"
              visibleTo = visibleTo.split(',').map(r => r.trim());
            }
          }

          // Normalize to lowercase for case-insensitive match
          const normalizedVisibleTo = visibleTo.map(role => role.toLowerCase());

          return normalizedVisibleTo.includes(role);
        } catch (e) {
          console.warn('Failed to parse visibleTo for event:', event.id);
          return false;
        }
      });
    }

    // Map color fallback
    events = events.map(e => ({
      ...e.toJSON(),
      color: e.color || '#A9A9A9'
    }));

    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

exports.createBulkEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ message: "Events should be an array" });
    }

    const processedEvents = events.map(e => {
      const startDate = new Date(e.start);
      const endDate = e.end ? new Date(e.end) : startDate;
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      return {
        ...e,
        start: startDate,
        end: endDate
      };
    });

    const created = await calendar.bulkCreate(processedEvents);
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating bulk events:", err);
    res.status(500).json({ message: "Error creating bulk events" });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, start, end, tag, visibleTo, color, description } = req.body;

    if (!title || !start) {
      return res.status(400).json({ message: "Title and start date are required" });
    }

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : startDate;

    // Zero out time portion so only date is stored
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    const event = await calendar.create({
      title,
      start: startDate,
      end: endDate,
      tag,
      visibleTo,
      color,
      description
    });

    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Error creating event" });
  }
};


exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    const deletedCount = await calendar.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ message: "Error deleting event" });
  }
};

exports.getAllEventsAdmin = async (req, res) => {
  try {
    const events = await calendar.findAll();

    // Apply dynamic color if not specified
    const result = events.map(event => ({
      ...event.toJSON(),
      color: event.color || colorMap[event.tag] || "#A9A9A9"
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Error fetching events" });
  }
};

