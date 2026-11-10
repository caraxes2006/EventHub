import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import MyTickets from "./pages/MyTickets";
import CheckIn from "./pages/CheckIn";
import Dashboard from "./pages/Dashboard";

const App = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route
        path="/create-event"
        element={
          <ProtectedRoute role="organizer">
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkin"
        element={
          <ProtectedRoute role="organizer">
            <CheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          <ProtectedRoute role="organizer">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute role="attendee">
            <MyTickets />
          </ProtectedRoute>
        }
      />
    </Routes>
  </>
);

export default App;
