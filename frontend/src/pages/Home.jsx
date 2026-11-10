import { useEffect, useState } from "react";
import { Search, CalendarX, Ticket, QrCode, LayoutDashboard, CalendarCheck } from "lucide-react";
import api from "../api/axios";
import EventCard from "../components/EventCard";
import DatePicker from "../components/DatePicker";
import HeroIllustration from "../components/HeroIllustration";

const FEATURES = [
  { icon: CalendarCheck, title: "Easy Booking", text: "Book your spot in seconds" },
  { icon: Ticket, title: "QR Tickets", text: "Your ticket is ready instantly" },
  { icon: QrCode, title: "Fast Check-in", text: "Scan codes at the door" },
  { icon: LayoutDashboard, title: "Organizer Tools", text: "Live registrations & revenue" },
];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Same API contract as before: GET /events?search=&date=
  const fetchEvents = async (s = search, d = date) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (s) params.search = s;
      if (d) params.date = d;
      const res = await api.get("/events", { params });
      setEvents(res.data);
    } catch (err) {
      setError("Could not load events. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleDateChange = (value) => {
    setDate(value);
    fetchEvents(search, value); // apply (or clear) the date filter immediately
  };

  const clearFilters = () => {
    setSearch("");
    setDate("");
    fetchEvents("", "");
  };

  const filtered = Boolean(search || date);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-text">
            <p className="eyebrow">Find your next experience</p>
            <h1>Discover amazing events.</h1>
            <p className="hero-sub">Connect, learn, and experience something new.</p>
          </div>
          <HeroIllustration />
        </div>
      </section>

      <div className="container home-container">
        <form className="search-panel" onSubmit={handleSearch} role="search">
          <label className="search-field">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Search by event name or venue</span>
            <input
              placeholder="Search by event name or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <DatePicker value={date} onChange={handleDateChange} />

          <button className="btn-primary search-btn" type="submit">
            <Search size={18} aria-hidden="true" /> Search events
          </button>
        </form>

        <div className="section-head">
          <div>
            <h2>Upcoming events</h2>
            <p className="muted">Find something worth showing up for.</p>
          </div>
          {!loading && !error && (
            <span className="muted result-count">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>

        {loading && <p className="state-msg">Loading events...</p>}
        {error && <p className="alert alert-error">{error}</p>}

        {!loading && !error && events.length === 0 && (
          <div className="empty-state">
            <CalendarX size={40} aria-hidden="true" />
            <h3>No events found</h3>
            <p className="muted">
              {filtered ? "Nothing matches your filters." : "There are no upcoming events right now."}
            </p>
            {filtered && (
              <button className="btn-outline" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>

        <section className="features" aria-label="Why EventHub">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div className="feature" key={title}>
              <span className="feature-icon">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default Home;
