import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate("/login");
  };

  const linkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" onClick={close}>
          Event<span>Hub</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-links${open ? " open" : ""}`} aria-label="Main navigation">
          <NavLink to="/" end className={linkClass} onClick={close}>
            Browse Events
          </NavLink>

          {user?.role === "organizer" && (
            <>
              <NavLink to="/create-event" className={linkClass} onClick={close}>
                Create Event
              </NavLink>
              <NavLink to="/checkin" className={linkClass} onClick={close}>
                Check-in Scanner
              </NavLink>
            </>
          )}

          {user?.role === "attendee" && (
            <NavLink to="/my-tickets" className={linkClass} onClick={close}>
              My Tickets
            </NavLink>
          )}

          {user ? (
            <div className="nav-user">
              <span className="nav-username">
                {user.name} <em>({user.role})</em>
              </span>
              <button className="btn-ghost" onClick={handleLogout}>
                <LogOut size={16} aria-hidden="true" /> Logout
              </button>
            </div>
          ) : (
            <div className="nav-user">
              <NavLink to="/login" className={linkClass} onClick={close}>
                Login
              </NavLink>
              <Link to="/register" className="btn-primary" onClick={close}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
