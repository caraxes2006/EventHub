import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios";

const Dashboard = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/dashboard/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"));

    api
      .get(`/tickets/event/${id}`)
      .then((res) => setTickets(res.data))
      .catch(() => {});
  }, [id]);

  if (error) return <div className="container"><p className="alert alert-error">{error}</p></div>;
  if (!data) return <div className="container">Loading dashboard...</div>;

  return (
    <div className="container">
      <Link to={`/events/${id}`} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Back to event
      </Link>
      <h1 className="page-title">{data.event.title} — Dashboard</h1>

      <div className="stats-grid">
        <div className="card stat">
          <p className="muted">Total registrations</p>
          <h2>{data.totalRegistrations} / {data.event.capacity}</h2>
        </div>
        <div className="card stat">
          <p className="muted">Checked in</p>
          <h2>{data.checkedInCount}</h2>
        </div>
        <div className="card stat">
          <p className="muted">Check-in rate</p>
          <h2>{data.checkInRate}%</h2>
        </div>
        <div className="card stat">
          <p className="muted">Revenue</p>
          <h2>₹{data.revenue}</h2>
        </div>
      </div>

      <h3>Attendees</h3>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 && (
              <tr><td colSpan={3}>No registrations yet.</td></tr>
            )}
            {tickets.map((t) => (
              <tr key={t._id}>
                <td>{t.attendee?.name}</td>
                <td>{t.attendee?.email}</td>
                <td>
                  <span className={t.checkedIn ? "tag tag-success" : "tag"}>
                    {t.checkedIn ? "Checked in" : "Registered"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
