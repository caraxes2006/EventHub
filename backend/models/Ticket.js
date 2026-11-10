const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    attendee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    qrCodeData: { type: String, required: true }, // raw string encoded into the QR image
    qrCodeImage: { type: String, required: true }, // base64 data URL, rendered in <img>
    pricePaid: { type: Number, required: true, default: 0 },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    cancelled: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent the same attendee holding two ACTIVE tickets for one event.
// Cancelled tickets are excluded so a user can re-book after cancelling.
ticketSchema.index(
  { event: 1, attendee: 1 },
  { unique: true, partialFilterExpression: { cancelled: false } }
);

module.exports = mongoose.model("Ticket", ticketSchema);
