// Populates the DB with demo users and events. Run: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");

const run = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Ticket.deleteMany({})]);

  const organizer = await User.create({
    name: "Priya Organizer",
    email: "organizer@demo.com",
    password: "password123",
    role: "organizer",
  });

  await User.create({
    name: "Arjun Attendee",
    email: "attendee@demo.com",
    password: "password123",
    role: "attendee",
  });

  // Credentials used in the Lab 10 test cases
  await User.create({
    name: "Test Attendee",
    email: "attendee@eventhub.com",
    password: "Secure@123",
    role: "attendee",
  });

  const events = await Event.insertMany([
    {
      title: "TechFest 2026 — Hackathon Kickoff",
      description: "A 24-hour campus hackathon with prizes, mentors, and free food.",
      venue: "Main Auditorium, Block A",
      date: new Date("2026-11-15"),
      time: "10:00",
      capacity: 150,
      ticketPrice: 0,
      organizer: organizer._id,
    },
    {
      title: "Alumni Networking Night",
      description: "An evening to connect with alumni across tech, product, and design.",
      venue: "Convention Hall",
      date: new Date("2026-11-28"),
      time: "18:30",
      capacity: 80,
      ticketPrice: 199,
      organizer: organizer._id,
    },
  ]);

  console.log("Seed complete:");
  console.log("  Organizer login -> organizer@demo.com / password123");
  console.log("  Attendee login  -> attendee@demo.com / password123");
  console.log("  Lab 10 attendee -> attendee@eventhub.com / Secure@123");
  console.log(`  Events created  -> ${events.map((e) => e.title).join(", ")}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
