const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/CalendarController");

// GET all events (optionally filter by role)
router.get("/events", calendarController.getAllEvents);

// POST create a single event
router.post("/events", calendarController.createEvent);

// POST create bulk events
router.post("/events/bulk", calendarController.createBulkEvents);

router.delete("/events/:id", calendarController.deleteEvent);

router.get("/get-events", calendarController.getAllEventsAdmin);

module.exports = router;
