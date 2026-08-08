import { Router } from "express";
import { db } from "../db/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { completeChallenge, todayStr } from "../services/gamification.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const challenges = db.challenges.all();
    const today = todayStr();
    const myCompletions = db.completions.find({ userId: req.user._id });

    const withStatus = challenges.map((c) => {
      const completionsForThis = myCompletions.filter((mc) => mc.challengeId === c._id);
      let completedNow = false;
      if (c.frequency === "once") completedNow = completionsForThis.length > 0;
      if (c.frequency === "daily") completedNow = completionsForThis.some((mc) => mc.completedOn === today);
      if (c.frequency === "weekly") {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        completedNow = completionsForThis.some(
          (mc) => new Date(mc.completedOn + "T00:00:00Z").getTime() >= weekAgo
        );
      }
      return { ...c, completedNow, timesCompleted: completionsForThis.length };
    });

    res.json({ challenges: withStatus });
  })
);

router.post(
  "/:id/complete",
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const result = completeChallenge(req.user._id, req.params.id);
      const { passwordHash, ...safeUser } = result.user;
      res.json({
        message: `Challenge completed! +${result.completion.pointsAwarded} Green Points.`,
        user: safeUser,
        completion: result.completion,
        newBadges: result.newBadges,
        campus: result.campus,
      });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ error: err.message || "Could not complete challenge." });
    }
  })
);

export default router;
