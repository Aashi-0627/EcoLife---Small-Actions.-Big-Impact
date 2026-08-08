# EcoLife — Small Actions. Big Impact.

A campus sustainability gamification app. Complete eco-challenges, earn Green
Points, build streaks, unlock badges, track your carbon footprint, and
compete with other campuses on the Green League leaderboard.

## Stack

- **Frontend:** React (Vite) + React Router (HashRouter) + Tailwind CSS v4 + Recharts + lucide-react
- **Backend:** Node.js + Express
- **Database:** File-based JSON datastore (`server/src/db/store.js`) that mirrors a
  Mongo-collection API (`find`, `findOne`, `insertOne`, `updateOne`, `deleteOne`...).
  This was used in place of a real MongoDB connection because this build
  environment cannot reach an external database host. **To switch to real
  MongoDB:** replace the internals of `server/src/db/store.js` with a Mongoose
  or native MongoDB driver implementation — every route and service calls the
  same `db.users`, `db.challenges`, etc. interface, so call sites don't change.
- **Auth:** JWT (`jsonwebtoken`) + bcrypt password hashing
- **Fonts:** self-hosted via `@fontsource` (Fraunces, Inter, JetBrains Mono) —
  no external network calls, safe on unreliable demo wifi.

## Project structure

```
ecolife/
  server/                 # Express API
    src/
      db/store.js          # JSON file datastore (Mongo-collection-style API)
      db/seed.js            # Idempotent seed data (campuses, challenges, badges, tips, recycling items)
      models/schemas.js     # Shape reference for each collection
      services/gamification.js  # Green Score, streaks, badges, campus scoring, challenge completion
      utils/emissionFactors.js  # Configurable CO2e factors for the carbon calculator
      routes/                # auth, challenges, campus, carbon, misc (badges/tips/recycling/profile)
      middleware/             # auth guard, error handler
      data/*.json             # persisted data (auto-created on first run)
      index.js                # Express app — also serves client/dist in production (see below)
  client/                 # React app (Vite)
    src/
      api/                  # axios client + endpoint wrappers
      context/               # AuthContext (session/refresh persistence), ToastContext (badge unlock toasts)
      components/             # Navbar, GrowthRing (signature Green Score visual), shared UI states
      pages/                  # Login, Dashboard, Challenges, Analytics, CampusLeague, Recycling, EcoTips, Achievements, Profile
```

## Running locally (development)

### 1. Backend

```bash
cd server
npm install
npm run dev        # http://localhost:5050
```

The first boot auto-seeds campuses, challenges, badges, eco tips, and
recycling items into `server/src/data/*.json`. Seeding is idempotent — it
won't duplicate data on restart, and data persists across restarts (real
file-based persistence, not in-memory).

### 2. Frontend

```bash
cd client
npm install
npm run dev         # http://localhost:5173, proxies /api to localhost:5050
```

Open http://localhost:5173 and click **"Try instant demo login"** for
instant access with no signup — or register a real account.

## Production build & deploy (single server, recommended)

```bash
cd client && npm install && npm run build   # outputs to client/dist
cd ../server && npm install && npm start    # serves API + built frontend on one port
```

Open **http://localhost:5050** — the Express server detects `client/dist` and
serves the built React app alongside the API from the same origin, so there's
no proxy/CORS configuration needed for a demo deployment. This was verified
end-to-end with a full production build + server restart.

### Split-host deployment (optional)

If you deploy the frontend and backend on different hosts (e.g. Vercel +
Render), set `VITE_API_URL` before building the client:

```bash
echo "VITE_API_URL=https://your-api-host.com/api" > client/.env.production.local
cd client && npm run build
```

The app uses `HashRouter`, so no server-side rewrite rules are needed for
client-side routes on any static host.

## Core loop (tested end-to-end, including a real headless-browser run)

Login → Dashboard → Complete Challenge → Green Points → Green Score → Streak
→ Badge → Environmental Impact → Campus Score → Campus Leaderboard

Completing a challenge is fully idempotent per its frequency (`daily` /
`weekly` / `once`) — duplicate completions are rejected with a 409 and a
clear message, both on the server and reflected in the UI (button shows
"Completed" and disables). Verified with real duplicate-completion attempts.

Refresh persistence, MongoDB-style data persistence across server restarts,
mobile responsiveness (390px viewport), and zero browser console/page/API
errors were all verified via an automated Playwright run against the actual
production build (`test_flow_final.py`).

## Known limitations

- **Database is file-based JSON, not real MongoDB.** This mirrors a
  Mongo-style API by design so it's a low-effort swap later, but it is not
  concurrency-safe under heavy simultaneous writes and won't survive a
  container/filesystem reset unless `server/src/data/` is persisted externally.
- **CO2e emission factors are simplified averages**, adequate for an
  educational estimator, not audit-grade carbon accounting.
- Carbon analytics charts look sparse with only 1–2 logged activities — this
  is expected chart behavior for low data density, not a bug; it fills in
  naturally as more activities are logged over multiple days.
