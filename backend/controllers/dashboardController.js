const Event = require("../models/Event");
const Ticket = require("../models/Ticket");

// GET /api/dashboard/:eventId — registrations, check-in rate, revenue (FR8)
const getEventDashboard = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view the dashboard for your own events" });
    }

    const tickets = await Ticket.find({ event: event._id, cancelled: false });
    const totalRegistrations = tickets.length;
    const checkedInCount = tickets.filter((t) => t.checkedIn).length;
    const checkInRate = totalRegistrations
      ? Number(((checkedInCount / totalRegistrations) * 100).toFixed(1))
      : 0;
    const revenue = tickets.reduce((sum, t) => sum + (t.pricePaid || 0), 0);

    res.json({
      event: { id: event._id, title: event.title, capacity: event.capacity },
      totalRegistrations,
      checkedInCount,
      checkInRate,
      seatsLeft: event.capacity - totalRegistrations,
      revenue,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard", error: err.message });
  }
};

// GET /api/dashboard/overview — summary across the organizer's events
const getOrganizerOverview = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const summary = await Promise.all(
      events.map(async (event) => {
        const tickets = await Ticket.find({ event: event._id, cancelled: false });
        return {
          eventId: event._id,
          title: event.title,
          date: event.date,
          totalRegistrations: tickets.length,
          checkedInCount: tickets.filter((t) => t.checkedIn).length,
          revenue: tickets.reduce((sum, t) => sum + (t.pricePaid || 0), 0),
        };
      })
    );
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed to load overview", error: err.message });
  }
};

module.exports = { getEventDashboard, getOrganizerOverview };
