# Assignment 02: RESTful API Service — Event Registration API

An Express + MongoDB API for college events. Students register for events; when an event is full they go on a waitlist, and when someone cancels, the first person on the waitlist is confirmed automatically.

## Folder layout
```
src/
  index.js        connects to MongoDB and starts the server
  app.js          middleware and route mounting
  models/         Event, Participant, Registration
  routes/         events.js, participants.js, registrations.js
  middleware/     validate.js (id check, field whitelist), errors.js
  utils/          ApiError class and async wrapper
  seed.js         sample data
  tests/          end-to-end tests (node:test)
```

## Endpoints (base `/api/v1`)
| Method | Path | Purpose |
|---|---|---|
| GET | /health | Health check |
| GET | /events | List events (`type`, `upcoming=true`, `q`, `page`, `limit`) |
| POST | /events | Create event |
| GET | /events/:id | Event with seats taken, seats left, waitlist size |
| PATCH | /events/:id | Update event (capacity cannot go below seats taken) |
| POST | /events/:id/cancel | Cancel event and all its registrations |
| DELETE | /events/:id | Delete event with no registrations |
| GET | /events/:id/registrations | Registrations, filter with `status` |
| GET | /events/:id/stats | Counts by status and by branch (aggregation) |
| GET, POST | /participants | List (`branch`, `year`) / create |
| GET, PATCH, DELETE | /participants/:id | One participant |
| GET | /participants/:id/registrations | A participant's events |
| POST | /registrations | Register `{ eventId, participantId }` → Confirmed or Waitlisted |
| GET | /registrations/:id | One registration |
| PATCH | /registrations/:id/cancel | Cancel and promote the waitlist |
| PATCH | /registrations/:id/check-in | Mark attendance |

Status codes: 200, 201, 204, 400 (bad id / bad JSON), 403 (registration closed), 404, 409 (duplicate, full capacity change, wrong state), 410 (event cancelled), 422 (validation), 500.

## How to run
1. Start MongoDB (4.x or later).
2. `cd src`, copy `.env.example` to `.env`, then `npm install`.
3. `npm run seed` (optional sample data), then `npm start`.
4. With the server running, `npm test` in another terminal runs 16 end-to-end tests.

Postman screenshots go in `screenshots/`.
