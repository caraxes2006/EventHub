// Unit tests for middleware/auth.js (protect + authorize). No database needed.
process.env.JWT_SECRET = "test-secret";
const jwt = require("jsonwebtoken");

jest.mock("../models/User", () => ({ findById: jest.fn() }));
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authorize()", () => {
  test("calls next() when the user's role is allowed", () => {
    const next = jest.fn();
    authorize("organizer")({ user: { role: "organizer" } }, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  test("returns 403 when the role is not allowed", () => {
    const res = mockRes();
    const next = jest.fn();
    authorize("organizer")({ user: { role: "attendee" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 when there is no user on the request", () => {
    const res = mockRes();
    authorize("attendee")({}, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe("protect()", () => {
  test("401 when no Authorization header is sent", async () => {
    const res = mockRes();
    await protect({ headers: {} }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("401 when the token is invalid", async () => {
    const res = mockRes();
    await protect({ headers: { authorization: "Bearer not.a.token" } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("401 when the user no longer exists", async () => {
    const token = jwt.sign({ id: "u1" }, "test-secret");
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const res = mockRes();
    await protect({ headers: { authorization: `Bearer ${token}` } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("attaches the user and calls next() for a valid token", async () => {
    const token = jwt.sign({ id: "u1" }, "test-secret");
    const user = { _id: "u1", role: "attendee" };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();
    await protect(req, mockRes(), next);
    expect(req.user).toBe(user);
    expect(next).toHaveBeenCalled();
  });
});
