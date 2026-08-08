import { Router } from "express";
import { db } from "../db/store.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getLeaderboard, getTopContributors } from "../services/gamification.js";

const router = Router();

router.get(
  "/leaderboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const leaderboard = getLeaderboard();
    const myCampusId = req.user.campusId;
    const myRank = leaderboard.find((c) => c._id === myCampusId) || null;
    res.json({ leaderboard, myCampusRank: myRank });
  })
);

router.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const campus = db.campuses.findById(req.params.id);
    if (!campus) return res.status(404).json({ error: "Campus not found." });
    const topContributors = getTopContributors(campus._id, 5);
    const leaderboard = getLeaderboard();
    const rank = leaderboard.find((c) => c._id === campus._id)?.rank || null;
    res.json({ campus, topContributors, rank });
  })
);

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ campuses: db.campuses.all() });
  })
);

export default router;
