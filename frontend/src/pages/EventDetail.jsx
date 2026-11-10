import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Sparkles } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError("Event not found");
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBook = async () => {
    if (!user) return navigate("/login");
    setBooking(true);
    setMessage("");
    setError("");
    try {
      await api.post(`/tickets/book/${id}`);
      setMessage("Ticket booked! Check 'My Tickets' for your QR code.");
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm("Cancel this event? Attendees will no longer be able to book it.")) return;
    await api.delete(`/events/${id}`);
    fetchEvent();
  };

  if (!event && error) return <div className="container"><p className="error-text">{error}</p></div>;
  if (!event) return <div className="container">Loading...</div>;

  const soldOut = event.seatsLeft <= 0;
  const isOwner = user && event.organizer && user._id === event.organizer._id;

  return (
    <div className="container">
      <div className="card event-detail">
        <div className="detail-banner banner-a" aria-hidden="true">
          <Sparkles size={40} strokeWidth={1.5} />
        </div>
        <h1>{event.title}</h1>
        <p className="meta-line">
          <CalendarDays size={18} aria-hidden="true" /> {formatDate(event.date)} · {event.time}
        </p>
        <p className="meta-line">
          <MapPin size={18} aria-hidden="true" /> {event.venue}
        </p>
        <p className="muted">Organized by {event.organizer?.name}</p>
        {event.status === "cancelled" && <p className="tag tag-danger">This event was cancelled</p>}

        <p className="event-desc">{event.description}</p>

        <div className="event-meta">
          <span className="price">{event.ticketPrice > 0 ? `₹${event.ticketPrice}` : "Free"}</span>
          <span className={soldOut ? "tag tag-danger" : "tag tag-success"}>
            {soldOut ? "Sold out" : `${event.seatsLeft} / ${event.capacity} seats left`}
          </span>
        </div>

        {message && <p className="alert" style={{ background: "var(--success-soft)", color: "var(--success)" }}>{message}</p>}
        {error && <p className="alert alert-error">{error}</p>}

        {user?.role === "attendee" && event.status !== "cancelled" && (
          <button className="btn-primary btn-block" onClick={handleBook} disabled={booking}>
            {booking ? "Booking..." : "Book Ticket"}
          </button>
        )}

        {!user && <p className="muted">Log in as an attendee to book a ticket.</p>}

        {isOwner && (
          <div className="owner-actions">
            <button className="btn-outline" onClick={() => navigate(`/dashboard/${event._id}`)}>
              View dashboard
            </button>
            {event.status !== "cancelled" && (
              <button className="btn-danger" onClick={handleCancelEvent}>
                Cancel event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
