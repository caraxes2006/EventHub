# EventHub – Event Management & Ticketing System

A MERN-stack web app where organizers create events and attendees book tickets that carry a unique QR code, scanned at the venue for one-time check-in.

## Features
- Register / login with two roles: **Organizer** and **Attendee** (JWT + bcrypt)
- Organizer: create, edit and cancel events; QR / manual-code check-in; dashboard (registrations, check-ins, revenue)
- Attendee: search events, book a ticket (capacity and duplicate checks), view QR tickets, cancel a ticket
- A ticket cannot be checked in twice; one active ticket per person per event (enforced by a DB index)

## Tech stack
React 18 + Vite, Express, MongoDB (Mongoose), JWT, bcryptjs, qrcode, html5-qrcode, Jest

## Run locally
**Backend**
```bash
cd backend
npm install
# create backend/.env
#   MONGO_URI=<your MongoDB connection string>
#   JWT_SECRET=<any long random string>
#   PORT=5000
node seed.js      # optional demo data
npm run dev
```
**Frontend**
```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

## Demo accounts (after seeding)
| Role | Email | Password |
|---|---|---|
| Organizer | organizer@demo.com | password123 |
| Attendee | attendee@demo.com | password123 |

## Tests
```bash
cd backend
npm test -- --coverage   # 41 tests, 3 suites
```

## Documentation
Full software engineering report (SRS, UML, estimation, testing): [`docs/SE_Project_Report_EventHub.pdf`](docs/SE_Project_Report_EventHub.pdf)

## Known limitations
No payment gateway, no e-mail notifications, no edit-event form in the UI (API only), no load testing.