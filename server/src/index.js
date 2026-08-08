import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import challengeRoutes from "./routes/challenges.js";
import campusRoutes from "./routes/campus.js";
import carbonRoutes from "./routes/carbon.js";
import miscRoutes from "./routes/misc.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import "./db/seed.js"; // idempotent seed on boot

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5050;

// In production, the built React app (client/dist) is served from the same
// origin/port as the API. This avoids any dev-proxy dependency and means a
// single `node src/index.js` after `npm run build` in /client is a complete,
// working deployment (no separate static server or reverse proxy needed).
const CLIENT_DIST = path.join(__dirname, "..", "..", "client", "dist");
const hasClientBuild = fs.existsSync(path.join(CLIENT_DIST, "index.html"));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ecolife-api", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/campus", campusRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api", miscRoutes);

// Serve the built frontend (if present) for any non-/api route, so the SPA's
// client-side router (HashRouter) handles navigation client-side.
if (hasClientBuild) {
  app.use(express.static(CLIENT_DIST));
  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
  console.log(`🖥  Serving frontend build from ${CLIENT_DIST}`);
} else {
  console.log("ℹ️  No client build found — API-only mode. Run `npm run build` in /client to enable serving the frontend here.");
}

app.use("/api", notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌱 EcoLife API running on http://localhost:${PORT}`);
});
