import { Router } from "express";
import { db } from "../db/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateCo2e, unitFor, EMISSION_FACTORS } from "../utils/emissionFactors.js";
import { todayStr } from "../services/gamification.js";

const router = Router();

router.get("/factors", requireAuth, (req, res) => {
  res.json({ factors: EMISSION_FACTORS });
});

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { category, activityType, quantity, date } = req.body || {};
    if (!category || !activityType) {
      return res.status(400).json({ error: "category and activityType are required." });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: "quantity must be a positive number." });
    }
    const co2eKg = calculateCo2e(category, activityType, qty);
    if (co2eKg === null) {
      return res.status(400).json({ error: "Unknown category/activityType combination." });
    }

    const activity = db.carbonActivities.insertOne({
      userId: req.user._id,
      category,
      activityType,
      quantity: qty,
      unit: unitFor(category, activityType),
      co2eKg,
      date: date || todayStr(),
    });

    res.status(201).json({ activity });
  })
);

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rangeDays = Number(req.query.range) || 30;
    const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;
    const all = db.carbonActivities
      .find({ userId: req.user._id })
      .filter((a) => new Date(a.date + "T00:00:00Z").getTime() >= cutoff)
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const totalCo2e = Math.round(all.reduce((s, a) => s + a.co2eKg, 0) * 1000) / 1000;
    const byCategory = all.reduce((acc, a) => {
      acc[a.category] = Math.round(((acc[a.category] || 0) + a.co2eKg) * 1000) / 1000;
      return acc;
    }, {});
    const byDate = all.reduce((acc, a) => {
      acc[a.date] = Math.round(((acc[a.date] || 0) + a.co2eKg) * 1000) / 1000;
      return acc;
    }, {});

    res.json({ activities: all, totalCo2e, byCategory, byDate, rangeDays });
  })
);

export default router;
