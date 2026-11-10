import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    capacity: 50,
    ticketPrice: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/events", form);
      navigate(`/events/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="card form-card" onSubmit={handleSubmit}>
        <h2>Create a new event</h2>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={form.title} onChange={handleChange} required />

        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} required />

        <label htmlFor="venue">Venue</label>
        <input id="venue" name="venue" value={form.venue} onChange={handleChange} required />

        <div className="form-row">
          <div>
            <label htmlFor="date">Date</label>
            <input type="date" id="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input type="time" id="time" name="time" value={form.time} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-row">
          <div>
            <label htmlFor="capacity">Capacity</label>
            <input type="number" min={1} id="capacity" name="capacity" value={form.capacity} onChange={handleChange} required />
          </div>
          <div>
            <label htmlFor="ticketPrice">Ticket price (₹, 0 = free)</label>
            <input type="number" min={0} id="ticketPrice" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} />
          </div>
        </div>

        <button className="btn-primary btn-block" disabled={loading}>
          {loading ? "Creating..." : "Create event"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
