import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>Log in</h2>
        {error && <p className="alert alert-error" role="alert">{error}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required />

        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} required />

        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="muted">
          No account? <Link to="/register">Sign up</Link>
        </p>
        <p className="muted small">
          Demo (after seeding): organizer@demo.com / attendee@demo.com — password123
        </p>
      </form>
    </div>
  );
};

export default Login;
