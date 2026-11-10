import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "attendee" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <label htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" autoComplete="new-password" minLength={6} value={form.password} onChange={handleChange} required />

        <label htmlFor="role">I am registering as</label>
        <select id="role" name="role" value={form.role} onChange={handleChange}>
          <option value="attendee">Attendee — browse & book events</option>
          <option value="organizer">Organizer — create & manage events</option>
        </select>

        <button className="btn-primary btn-block" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
