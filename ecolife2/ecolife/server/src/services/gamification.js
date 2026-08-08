import { db } from "../db/store.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export function todayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db_ = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db_ - da) / DAY_MS);
}

// Green Score = weighted blend of lifetime points and current streak,
// so consistency (not just volume) is rewarded.
export function computeGreenScore({ greenPoints, currentStreak }) {
  return Math.round(greenPoints * 1 + currentStreak * 15);
}

export function computeLevel(greenScore) {
  // Simple level curve: every 250 green score = 1 level, min level 1
  return Math.max(1, Math.floor(greenScore / 250) + 1);
}

export function updateStreak(user, completionDateStr) {
  let { currentStreak, longestStreak, lastCompletionDate } = user;
  if (!lastCompletionDate) {
    currentStreak = 1;
  } else {
    const gap = daysBetween(lastCompletionDate, completionDateStr);
    if (gap === 0) {
      // already completed something today; streak unchanged
    } else if (gap === 1) {
      currentStreak += 1;
    } else if (gap > 1) {
      currentStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak || 0, currentStreak);
  return { currentStreak, longestStreak, lastCompletionDate: completionDateStr };
}

export function checkAndAwardBadges(user) {
  const allBadges = db.badges.all();
  const earned = db.userBadges.find({ userId: user._id });
  const earnedIds = new Set(earned.map((b) => b.badgeId));
  const newlyAwarded = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge._id)) continue;
    const { type, value, category } = badge.condition;
    let qualifies = false;

    if (type === "points") qualifies = user.greenPoints >= value;
    else if (type === "streak") qualifies = user.currentStreak >= value;
    else if (type === "challengeCount") {
      qualifies = db.completions.count({ userId: user._id }) >= value;
    } else if (type === "category") {
      const completions = db.completions.find({ userId: user._id });
      const challengeIds = new Set(
        db.challenges.find({ category }).map((c) => c._id)
      );
      const count = completions.filter((c) => challengeIds.has(c.challengeId)).length;
      qualifies = count >= value;
    }

    if (qualifies) {
      const record = db.userBadges.insertOne({
        userId: user._id,
        badgeId: badge._id,
        earnedAt: new Date().toISOString(),
      });
      newlyAwarded.push({ ...record, badge });
    }
  }
  return newlyAwarded;
}

export function updateCampusScore(campusId) {
  if (!campusId) return null;
  const members = db.users.find({ campusId });
  const totalPoints = members.reduce((sum, u) => sum + (u.greenPoints || 0), 0);
  return db.updateCampus
    ? null
    : db.campuses.updateById(campusId, {
        totalPoints,
        memberCount: members.length,
      });
}

/**
 * Completes a challenge for a user with full idempotency + reward pipeline.
 * Throws { code, message } style errors the route layer turns into HTTP responses.
 */
export function completeChallenge(userId, challengeId) {
  const user = db.users.findById(userId);
  if (!user) throw { status: 404, message: "User not found" };

  const challenge = db.challenges.findById(challengeId);
  if (!challenge) throw { status: 404, message: "Challenge not found" };

  const today = todayStr();

  // Duplicate-prevention rules based on challenge frequency
  const priorCompletions = db.completions.find({ userId, challengeId });
  if (challenge.frequency === "once" && priorCompletions.length > 0) {
    throw { status: 409, message: "You already completed this one-time challenge." };
  }
  if (challenge.frequency === "daily") {
    const doneToday = priorCompletions.some((c) => c.completedOn === today);
    if (doneToday) {
      throw { status: 409, message: "You already completed this challenge today. Come back tomorrow!" };
    }
  }
  if (challenge.frequency === "weekly") {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * DAY_MS);
    const doneThisWeek = priorCompletions.some(
      (c) => new Date(c.completedOn + "T00:00:00Z") >= weekAgo
    );
    if (doneThisWeek) {
      throw { status: 409, message: "You already completed this weekly challenge. Try again next week!" };
    }
  }

  // 1. Save completion record
  const completion = db.completions.insertOne({
    userId,
    challengeId,
    completedOn: today,
    pointsAwarded: challenge.points,
    co2SavedKg: challenge.co2SavedKg || 0,
  });

  // 2. Award Green Points + environmental impact
  const greenPoints = (user.greenPoints || 0) + challenge.points;
  const co2SavedKg = Math.round(((user.co2SavedKg || 0) + (challenge.co2SavedKg || 0)) * 1000) / 1000;

  // 3. Update streak
  const streakUpdate = updateStreak(user, today);

  // 4. Compute green score + level
  const greenScore = computeGreenScore({ greenPoints, currentStreak: streakUpdate.currentStreak });
  const level = computeLevel(greenScore);

  const updatedUser = db.users.updateById(userId, {
    greenPoints,
    co2SavedKg,
    greenScore,
    level,
    ...streakUpdate,
  });

  // 5. Badge check
  const newBadges = checkAndAwardBadges(updatedUser);

  // 6. Campus score update
  const campus = updateCampusScore(updatedUser.campusId);

  return { user: updatedUser, completion, newBadges, campus, challenge };
}

export function getLeaderboard({ scope = "all-time", campusId = null } = {}) {
  let campuses = db.campuses.all();
  if (campusId) campuses = campuses.filter((c) => c._id === campusId);
  return campuses
    .map((c) => ({ ...c }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

export function getTopContributors(campusId, limit = 5) {
  return db.users
    .find({ campusId })
    .sort((a, b) => b.greenPoints - a.greenPoints)
    .slice(0, limit)
    .map(({ passwordHash, ...safe }) => safe);
}
