const express = require("express");
const {
  bookTicket,
  getMyTickets,
  getTicketsForEvent,
  checkInTicket,
  cancelTicket,
} = require("../controllers/ticketController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/book/:eventId", protect, authorize("attendee"), bookTicket);
router.get("/my", protect, authorize("attendee"), getMyTickets);
router.get("/event/:eventId", protect, authorize("organizer"), getTicketsForEvent);
router.put("/:id/cancel", protect, authorize("attendee"), cancelTicket);
router.post("/checkin", protect, authorize("organizer"), checkInTicket);

module.exports = router;
