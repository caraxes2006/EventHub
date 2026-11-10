const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", protect, authorize("organizer"), createEvent);
router.put("/:id", protect, authorize("organizer"), updateEvent);
router.delete("/:id", protect, authorize("organizer"), deleteEvent);

module.exports = router;
