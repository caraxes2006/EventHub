const express = require("express");
const { getEventDashboard, getOrganizerOverview } = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/overview", protect, authorize("organizer"), getOrganizerOverview);
router.get("/:eventId", protect, authorize("organizer"), getEventDashboard);

module.exports = router;
