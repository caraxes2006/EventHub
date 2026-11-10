const Event = require("../models/Event");
const Ticket = require("../models/Ticket");

// GET /api/events  — browse/search by name, date, venue (FR3)
const getEvents = async (req, res) => {
  try {
    const { search, date, venue } = req.query;
    const query = { status: { $ne: "cancelled" } };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }
    if (venue) {
      query.venue = { $regex: venue, $options: "i" };
    }
    if (date) {
      const day = new Date(date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      query.date = { $gte: day, $lt: nextDay };
    }

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ date: 1 });

    const eventsWithCounts = await Promise.all(
      events.map(async (ev) => {
        const bookedCount = await Ticket.countDocuments({ event: ev._id, cancelled: false });
        return { ...ev.toObject(), bookedCount, seatsLeft: ev.capacity - bookedCount };
      })
    );

    res.json(eventsWithCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
};

// GET /api/events/:id
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");
    if (!event) return res.status(404).json({ message: "Event not found" });

    const bookedCount = await Ticket.countDocuments({ event: event._id, cancelled: false });
    res.json({ ...event.toObject(), bookedCount, seatsLeft: event.capacity - bookedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
  }
};

// POST /api/events  (FR2)
const createEvent = async (req, res) => {
  try {
    const { title, description, venue, date, time, capacity, ticketPrice } = req.body;

    if (!title || !description || !venue || !date || !time || !capacity) {
      return res.status(400).json({ message: "Missing required event fields" });
    }

    const event = await Event.create({
      title,
      description,
      venue,
      date,
      time,
      capacity,
      ticketPrice: ticketPrice || 0,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

// PUT /api/events/:id  (FR2)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own events" });
    }

    const fields = ["title", "description", "venue", "date", "time", "capacity", "ticketPrice", "status"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event", error: err.message });
  }
};

// DELETE /api/events/:id — soft cancel (FR2)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own events" });
    }

    event.status = "cancelled";
    await event.save();
    res.json({ message: "Event cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel event", error: err.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
