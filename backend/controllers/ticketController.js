const QRCode = require("qrcode");
const crypto = require("crypto");
const Ticket = require("../models/Ticket");
const Event = require("../models/Event");

// POST /api/tickets/book/:eventId — book with capacity check (FR4), QR generated (FR5)
const bookTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status === "cancelled") {
      return res.status(400).json({ message: "This event has been cancelled" });
    }

    const bookedCount = await Ticket.countDocuments({ event: event._id, cancelled: false });
    if (bookedCount >= event.capacity) {
      return res.status(400).json({ message: "Event is fully booked" });
    }

    const existing = await Ticket.findOne({ event: event._id, attendee: req.user._id, cancelled: false });
    if (existing) {
      return res.status(400).json({ message: "You have already booked a ticket for this event" });
    }

    // Unique, unguessable code embedded in the QR and verified at check-in
    const qrCodeData = crypto.randomBytes(16).toString("hex");
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, { width: 300, margin: 2 });

    const ticket = await Ticket.create({
      event: event._id,
      attendee: req.user._id,
      qrCodeData,
      qrCodeImage,
      pricePaid: event.ticketPrice,
    });

    const populated = await ticket.populate("event", "title venue date time");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "You have already booked a ticket for this event" });
    }
    res.status(500).json({ message: "Failed to book ticket", error: err.message });
  }
};

// GET /api/tickets/my
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ attendee: req.user._id })
      .populate("event", "title venue date time ticketPrice status")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets", error: err.message });
  }
};

// GET /api/tickets/event/:eventId — organizer sees attendees
const getTicketsForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view tickets for your own events" });
    }

    const tickets = await Ticket.find({ event: event._id, cancelled: false })
      .populate("attendee", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets", error: err.message });
  }
};

// POST /api/tickets/checkin — verify QR and mark attendance (FR6, FR7)
const checkInTicket = async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    if (!qrCodeData) return res.status(400).json({ message: "qrCodeData is required" });

    const ticket = await Ticket.findOne({ qrCodeData })
      .populate("event")
      .populate("attendee", "name email");

    if (!ticket) {
      return res.status(404).json({ message: "Invalid ticket — no matching booking found" });
    }

    if (ticket.event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This ticket does not belong to one of your events" });
    }

    if (ticket.cancelled) {
      return res.status(400).json({ message: "Ticket was cancelled" });
    }

    if (ticket.checkedIn) {
      return res.status(409).json({
        message: `Ticket already checked in at ${ticket.checkedInAt.toLocaleString()}`,
        ticket,
      });
    }

    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.json({ message: "Check-in successful", ticket });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};

// PUT /api/tickets/:id/cancel — attendee cancels their own ticket
const cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.attendee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only cancel your own tickets" });
    }
    if (ticket.cancelled) {
      return res.status(400).json({ message: "Ticket is already cancelled" });
    }
    if (ticket.checkedIn) {
      return res.status(400).json({ message: "A checked-in ticket cannot be cancelled" });
    }

    ticket.cancelled = true;
    ticket.cancelledAt = new Date();
    await ticket.save();
    res.json({ message: "Ticket cancelled", ticket });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel ticket", error: err.message });
  }
};

module.exports = { bookTicket, getMyTickets, getTicketsForEvent, checkInTicket, cancelTicket };
