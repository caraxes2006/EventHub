import { useEffect, useState } from "react";
import api from "../api/axios";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/tickets/my")
      .then((res) => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this ticket? This cannot be undone.")) return;
    setError("");
    try {
      await api.put(`/tickets/${id}/cancel`);
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, cancelled: true } : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel ticket");
    }
  };

  if (loading) return <div className="container">Loading your tickets...</div>;

  return (
    <div className="container">
      <h1 className="page-title">My tickets</h1>
      {error && <p className="alert alert-error">{error}</p>}
      {tickets.length === 0 && <p>You haven't booked any tickets yet.</p>}

      <div className="grid">
        {tickets.map((ticket) => (
          <div className="card ticket-card" key={ticket._id}>
            <h3>{ticket.event?.title}</h3>
            <p className="muted">
              {formatDate(ticket.event?.date)} · {ticket.event?.time} · {ticket.event?.venue}
            </p>
            {!ticket.cancelled && (
              <img src={ticket.qrCodeImage} alt="Ticket QR code" className="qr-image" />
            )}
            <p
              className={
                ticket.cancelled ? "tag tag-danger" : ticket.checkedIn ? "tag tag-success" : "tag"
              }
            >
              {ticket.cancelled ? "Cancelled" : ticket.checkedIn ? "Checked in" : "Not checked in yet"}
            </p>
            {!ticket.cancelled && !ticket.checkedIn && (
              <button className="btn-danger" onClick={() => handleCancel(ticket._id)}>
                Cancel Ticket
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTickets;
