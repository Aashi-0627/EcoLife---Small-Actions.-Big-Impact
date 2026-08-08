import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "../db/store.js";
import { signToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function sanitize(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password, campusId } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required." });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existing = db.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    if (campusId && !db.campuses.findById(campusId)) {
      return res.status(400).json({ error: "Selected campus does not exist." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = db.users.insertOne({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      campusId: campusId || null,
      avatarSeed: nanoid(6),
      greenPoints: 0,
      greenScore: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      co2SavedKg: 0,
      isDemo: false,
    });

    if (campusId) {
      const campus = db.campuses.findById(campusId);
      db.campuses.updateById(campusId, { memberCount: (campus.memberCount || 0) + 1 });
    }

    const token = signToken({ sub: user._id });
    res.status(201).json({ token, user: sanitize(user) });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!validateEmail(email) || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ sub: user._id });
    res.json({ token, user: sanitize(user) });
  })
);

// Demo login: creates (once) or reuses a shared demo account so judges can
// explore instantly without registering.
router.post(
  "/demo-login",
  asyncHandler(async (req, res) => {
    let user = db.users.findOne({ email: "demo@ecolife.app" });
    if (!user) {
      const campus = db.campuses.all()[0];
      const passwordHash = await bcrypt.hash("demo-account-no-password", 10);
      user = db.users.insertOne({
        name: "Demo Explorer",
        email: "demo@ecolife.app",
        passwordHash,
        campusId: campus ? campus._id : null,
        avatarSeed: "demo01",
        greenPoints: 0,
        greenScore: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null,
        co2SavedKg: 0,
        isDemo: true,
      });
      if (campus) {
        db.campuses.updateById(campus._id, { memberCount: (campus.memberCount || 0) + 1 });
      }
    }
    const token = signToken({ sub: user._id });
    res.json({ token, user: sanitize(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: sanitize(req.user) });
  })
);

export default router;
