import { Router } from "express";
import { db } from "../db/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ---- Achievements / Badges ----
router.get(
  "/badges",
  requireAuth,
  asyncHandler(async (req, res) => {
    const allBadges = db.badges.all();
    const earned = db.userBadges.find({ userId: req.user._id });
    const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

    const withProgress = allBadges.map((b) => {
      let progressValue = 0;
      const { type, value, category } = b.condition;
      if (type === "points") progressValue = req.user.greenPoints;
      else if (type === "streak") progressValue = req.user.currentStreak;
      else if (type === "challengeCount") progressValue = db.completions.count({ userId: req.user._id });
      else if (type === "category") {
        const challengeIds = new Set(db.challenges.find({ category }).map((c) => c._id));
        progressValue = db.completions
          .find({ userId: req.user._id })
          .filter((c) => challengeIds.has(c.challengeId)).length;
      }
      return {
        ...b,
        earned: earnedMap.has(b._id),
        earnedAt: earnedMap.get(b._id) || null,
        progress: Math.min(progressValue, value),
        target: value,
      };
    });

    res.json({ badges: withProgress });
  })
);

// ---- Eco Tips ----
router.get(
  "/eco-tips",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    const tips = category ? db.ecoTips.find({ category }) : db.ecoTips.all();
    res.json({ tips });
  })
);

// ---- Recycling search ----
router.get(
  "/recycling",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = (req.query.q || "").toLowerCase().trim();
    const category = req.query.category;
    let items = db.recyclingItems.all();
    if (category) items = items.filter((i) => i.category === category);
    if (q) items = items.filter((i) => i.name.toLowerCase().includes(q));
    res.json({ items });
  })
);

// ---- Profile ----
router.get(
  "/users/me/stats",
  requireAuth,
  asyncHandler(async (req, res) => {
    const completions = db.completions.find({ userId: req.user._id });
    const badgesEarned = db.userBadges.count({ userId: req.user._id });
    const campus = req.user.campusId ? db.campuses.findById(req.user.campusId) : null;
    res.json({
      totalChallengesCompleted: completions.length,
      badgesEarned,
      campus,
    });
  })
);

router.patch(
  "/users/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, campusId } = req.body || {};
    const update = {};
    if (name && name.trim()) update.name = name.trim();
    if (campusId !== undefined) {
      if (campusId && !db.campuses.findById(campusId)) {
        return res.status(400).json({ error: "Selected campus does not exist." });
      }
      update.campusId = campusId || null;
    }
    const updated = db.users.updateById(req.user._id, update);
    const { passwordHash, ...safe } = updated;
    res.json({ user: safe });
  })
);

export default router;
