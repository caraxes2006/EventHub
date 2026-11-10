// Unit tests for authController (register / login) with the User model mocked.
process.env.JWT_SECRET = "test-secret";
jest.mock("../models/User", () => ({ findOne: jest.fn(), create: jest.fn() }));
const User = require("../models/User");
const { register, login, getMe } = require("../controllers/authController");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
beforeEach(() => jest.clearAllMocks());

describe("register", () => {
  test("400 when required fields are missing", async () => {
    const res = mockRes();
    await register({ body: { email: "a@b.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 when the email is already registered", async () => {
    User.findOne.mockResolvedValue({ _id: "u1" });
    const res = mockRes();
    await register({ body: { name: "A", email: "a@b.com", password: "123456" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("201 with a token; unknown roles fall back to attendee", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "u1", role: "attendee" });
    const res = mockRes();
    await register({ body: { name: "A", email: "a@b.com", password: "123456", role: "admin" } }, res);
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: "attendee" }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("organizer role is kept", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "u2" });
    await register({ body: { name: "O", email: "o@b.com", password: "123456", role: "organizer" } }, mockRes());
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: "organizer" }));
  });

  test("500 on an unexpected error", async () => {
    User.findOne.mockRejectedValue(new Error("x"));
    const res = mockRes();
    await register({ body: { name: "A", email: "a@b.com", password: "123456" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("login", () => {
  test("400 when email or password is missing", async () => {
    const res = mockRes();
    await login({ body: { email: "a@b.com" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("401 'Invalid email or password' for an unknown user", async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login({ body: { email: "ghost@x.com", password: "x" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
  });

  test("401 for a wrong password", async () => {
    User.findOne.mockResolvedValue({ matchPassword: jest.fn().mockResolvedValue(false) });
    const res = mockRes();
    await login({ body: { email: "a@b.com", password: "bad" } }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns user and token for valid credentials", async () => {
    User.findOne.mockResolvedValue({ _id: "u1", matchPassword: jest.fn().mockResolvedValue(true) });
    const res = mockRes();
    await login({ body: { email: "a@b.com", password: "ok" } }, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
  });

  test("500 on an unexpected error", async () => {
    User.findOne.mockRejectedValue(new Error("x"));
    const res = mockRes();
    await login({ body: { email: "a@b.com", password: "ok" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

test("getMe returns the logged-in user", async () => {
  const res = mockRes();
  await getMe({ user: { _id: "u1" } }, res);
  expect(res.json).toHaveBeenCalledWith({ _id: "u1" });
});
