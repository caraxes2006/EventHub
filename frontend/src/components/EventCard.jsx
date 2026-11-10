import { Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowRight, Sparkles } from "lucide-react";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

// The data model has no image/category fields, so each card gets a tasteful
// gradient banner (picked deterministically from the event id) instead of a
// made-up category or a hotlinked photo that could break.
const BANNERS = ["banner-a", "banner-b", "banner-c", "banner-d"];
const bannerFor = (id = "") => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANNERS[h % BANNERS.length];
};

const EventCard = ({ event }) => {
  const soldOut = event.seatsLeft <= 0;

  return (
    <article className="event-card">
      <div className={`event-banner ${bannerFor(event._id)}`} aria-hidden="true">
        <Sparkles size={40} strokeWidth={1.5} />
      </div>

      <div className="event-card-body">
        <h3>{event.title}</h3>

        <ul className="event-info">
          <li>
            <CalendarDays size={16} aria-hidden="true" />
            <span>
              {formatDate(event.date)} · {event.time}
            </span>
          </li>
          <li>
            <MapPin size={16} aria-hidden="true" />
            <span>{event.venue}</span>
          </li>
        </ul>

        <p className="event-desc">{event.description}</p>

        <div className="event-meta">
          <span className="price">{event.ticketPrice > 0 ? `₹${event.ticketPrice}` : "Free"}</span>
          <span className={soldOut ? "tag tag-danger" : "tag tag-success"}>
            {soldOut ? "Sold out" : `${event.seatsLeft} seats left`}
          </span>
        </div>

        <Link to={`/events/${event._id}`} className="btn-primary btn-block">
          View details <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

export default EventCard;
