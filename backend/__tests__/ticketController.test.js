// Unit tests for ticketController (book, cancel, check-in) with the models mocked.
jest.mock("../models/Ticket", () => ({
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
}));
jest.mock("../models/Event", () => ({ findById: jest.fn() }));
jest.mock("qrcode", () => ({ toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,QR") }));

const Ticket = require("../models/Ticket");
const Event = require("../models/Event");
const {
  bookTicket,
  cancelTicket,
  checkInTicket,
  getMyTickets,
  getTicketsForEvent,
} = require("../controllers/ticketController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const user = { _id: "u1" };

beforeEach(() => jest.clearAllMocks());

describe("bookTicket", () => {
  const req = { params: { eventId: "e1" }, user };

  test("404 when the event does not exist", async () => {
    Event.findById.mockResolvedValue(null);
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 when the event is cancelled", async () => {
    Event.findById.mockResolvedValue({ _id: "e1", status: "cancelled" });
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 'Event is fully booked' when capacity is reached", async () => {
    Event.findById.mockResolvedValue({ _id: "e1", status: "upcoming", capacity: 2 });
    Ticket.countDocuments.mockResolvedValue(2);
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Event is fully booked" });
  });

  test("400 when the attendee already holds an active ticket", async () => {
    Event.findById.mockResolvedValue({ _id: "e1", status: "upcoming", capacity: 5 });
    Ticket.countDocuments.mockResolvedValue(1);
    Ticket.findOne.mockResolvedValue({ _id: "t0" });
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("201 and a QR code on a successful booking", async () => {
    Event.findById.mockResolvedValue({ _id: "e1", status: "upcoming", capacity: 5, ticketPrice: 199 });
    Ticket.countDocuments.mockResolvedValue(1);
    Ticket.findOne.mockResolvedValue(null);
    const populate = jest.fn().mockResolvedValue({ _id: "t1" });
    Ticket.create.mockResolvedValue({ populate });
    const res = mockRes();
    await bookTicket(req, res);
    expect(Ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({ pricePaid: 199, qrCodeImage: "data:image/png;base64,QR" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("400 on a duplicate-key race (error code 11000)", async () => {
    Event.findById.mockRejectedValue({ code: 11000 });
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("500 on an unexpected error", async () => {
    Event.findById.mockRejectedValue(new Error("db down"));
    const res = mockRes();
    await bookTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("cancelTicket", () => {
  const req = { params: { id: "t1" }, user };
  const make = (over = {}) => ({
    attendee: "u1", cancelled: false, checkedIn: false, save: jest.fn().mockResolvedValue(), ...over,
  });

  test("404 when the ticket does not exist", async () => {
    Ticket.findById.mockResolvedValue(null);
    const res = mockRes();
    await cancelTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("403 when the ticket belongs to someone else", async () => {
    Ticket.findById.mockResolvedValue(make({ attendee: "other" }));
    const res = mockRes();
    await cancelTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("400 when already cancelled", async () => {
    Ticket.findById.mockResolvedValue(make({ cancelled: true }));
    const res = mockRes();
    await cancelTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 when already checked in", async () => {
    Ticket.findById.mockResolvedValue(make({ checkedIn: true }));
    const res = mockRes();
    await cancelTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("cancels the ticket and saves it", async () => {
    const t = make();
    Ticket.findById.mockResolvedValue(t);
    const res = mockRes();
    await cancelTicket(req, res);
    expect(t.cancelled).toBe(true);
    expect(t.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Ticket cancelled" }));
  });

  test("500 on an unexpected error", async () => {
    Ticket.findById.mockRejectedValue(new Error("x"));
    const res = mockRes();
    await cancelTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("checkInTicket", () => {
  const find = (ticket) =>
    Ticket.findOne.mockReturnValue({ populate: () => ({ populate: () => Promise.resolve(ticket) }) });
  const base = () => ({
    event: { organizer: "u1" }, cancelled: false, checkedIn: false,
    checkedInAt: null, save: jest.fn().mockResolvedValue(),
  });

  test("400 when qrCodeData is missing", async () => {
    const res = mockRes();
    await checkInTicket({ body: {}, user }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("404 for an unknown code", async () => {
    find(null);
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("403 when the ticket is for another organizer's event", async () => {
    find({ ...base(), event: { organizer: "other" } });
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("400 for a cancelled ticket", async () => {
    find({ ...base(), cancelled: true });
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("409 when the ticket is already checked in", async () => {
    find({ ...base(), checkedIn: true, checkedInAt: new Date() });
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("marks a valid ticket as checked in", async () => {
    const t = base();
    find(t);
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(t.checkedIn).toBe(true);
    expect(t.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Check-in successful" }));
  });

  test("500 on an unexpected error", async () => {
    Ticket.findOne.mockImplementation(() => { throw new Error("x"); });
    const res = mockRes();
    await checkInTicket({ body: { qrCodeData: "x" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("list endpoints", () => {
  test("getMyTickets returns the attendee's tickets", async () => {
    Ticket.find.mockReturnValue({ populate: () => ({ sort: () => Promise.resolve([{ _id: "t1" }]) }) });
    const res = mockRes();
    await getMyTickets({ user }, res);
    expect(res.json).toHaveBeenCalledWith([{ _id: "t1" }]);
  });

  test("getTicketsForEvent 403 for a non-owner", async () => {
    Event.findById.mockResolvedValue({ _id: "e1", organizer: "other" });
    const res = mockRes();
    await getTicketsForEvent({ params: { eventId: "e1" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getTicketsForEvent 404 when the event is missing", async () => {
    Event.findById.mockResolvedValue(null);
    const res = mockRes();
    await getTicketsForEvent({ params: { eventId: "e1" }, user }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
