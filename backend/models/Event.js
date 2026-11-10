const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g. "18:00"
    capacity: { type: Number, required: true, min: 1 },
    ticketPrice: { type: Number, required: true, min: 0, default: 0 },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "cancelled", "completed"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

eventSchema.index({ title: "text", venue: "text" });

module.exports = mongoose.model("Event", eventSchema);
