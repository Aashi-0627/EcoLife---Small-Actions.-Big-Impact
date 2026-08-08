import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Flame, Leaf, TrendingUp, Trophy, CheckCircle2, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ChallengeAPI, CampusAPI, BadgeAPI } from "../api/endpoints";
import GrowthRing from "../components/GrowthRing";
import { Card, ErrorBanner, PageLoader, EmptyState } from "../components/Shared";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const { push } = useToast();
  const [challenges, setChallenges] = useState([]);
  const [campusRank, setCampusRank] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [challengeData, leaderboardData, badgeData] = await Promise.all([
        ChallengeAPI.list(),
        CampusAPI.leaderboard(),
        BadgeAPI.list(),
      ]);
      setChallenges(challengeData.challenges);
      setCampusRank(leaderboardData.myCampusRank);
      setRecentBadges(badgeData.badges.filter((b) => b.earned).slice(-3).reverse());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async (challenge) => {
    setCompletingId(challenge._id);
    try {
      const result = await ChallengeAPI.complete(challenge._id);
      push({
        title: "Challenge complete!",
        message: `+${result.completion.pointsAwarded} Green Points earned.`,
        emoji: "🌿",
      });
      if (result.newBadges?.length) {
        result.newBadges.forEach((nb) =>
          push({
            variant: "badge",
            title: "Badge unlocked!",
            message: nb.badge.name,
            emoji: "🏅",
          })
        );
      }
      await Promise.all([refreshUser(), load()]);
    } catch (err) {
      push({ variant: "error", title: "Couldn't complete challenge", message: err.message, emoji: "⚠️" });
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) return <PageLoader label="Loading your dashboard..." />;

  const todaysChallenges = challenges.filter((c) => !c.completedNow).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <ErrorBanner message={error} onRetry={load} />

      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy">
          Welcome back, {user?.name?.split(" ")[0] || "Explorer"} 🌱
        </h1>
        <p className="text-moss-dark text-sm mt-1">Here's your environmental impact so far.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Green Score + streak + badge summary */}
        <Card className="p-6 flex flex-col items-center text-center lg:col-span-1">
          <GrowthRing score={user?.greenScore ?? 0} level={user?.level ?? 1} />
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-1.5 text-clay-dark">
              <Flame size={18} />
              <span className="font-mono font-semibold">{user?.currentStreak ?? 0}</span>
              <span className="text-xs text-bark/60">day streak</span>
            </div>
            <div className="w-px h-6 bg-moss/15" />
            <div className="flex items-center gap-1.5 text-moss-dark">
              <Leaf size={18} />
              <span className="font-mono font-semibold">{user?.greenPoints ?? 0}</span>
              <span className="text-xs text-bark/60">points</span>
            </div>
          </div>
        </Card>

        {/* Environmental impact + campus rank */}
        <Card className="p-6 lg:col-span-2 flex flex-col gap-5">
          <div>
            <h2 className="font-semibold text-bark flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-moss" /> Environmental Impact
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ImpactStat label="CO₂e Saved" value={`${(user?.co2SavedKg ?? 0).toFixed(2)} kg`} />
              <ImpactStat label="Longest Streak" value={`${user?.longestStreak ?? 0} days`} />
              <ImpactStat label="Level" value={user?.level ?? 1} />
            </div>
          </div>
          <div className="border-t border-moss/10 pt-4">
            <h2 className="font-semibold text-bark flex items-center gap-2 mb-2">
              <Trophy size={18} className="text-clay" /> Campus Standing
            </h2>
            {campusRank ? (
              <div className="flex items-center justify-between bg-mist rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-bark">{campusRank.name}</p>
                  <p className="text-xs text-moss-dark">{campusRank.totalPoints} total campus points</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-moss">#{campusRank.rank}</p>
                  <p className="text-xs text-bark/50">campus rank</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-bark/60">
                Join a campus from your profile to appear on the Campus League.
              </p>
            )}
            <Link
              to="/campus-league"
              className="inline-block mt-3 text-sm text-moss font-medium hover:underline"
            >
              View full leaderboard →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick challenges */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-bark">Today's Challenges</h2>
          <Link to="/challenges" className="text-sm text-moss font-medium hover:underline">
            See all →
          </Link>
        </div>
        {todaysChallenges.length === 0 ? (
          <Card className="p-6">
            <EmptyState
              icon={CheckCircle2}
              title="All caught up!"
              body="You've completed every available challenge for now. Check back tomorrow for daily challenges."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todaysChallenges.map((c) => (
              <Card key={c._id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-bark truncate">{c.title}</p>
                  <p className="text-xs text-bark/60 mt-0.5">{c.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono bg-moss/10 text-moss-dark rounded-full px-2 py-0.5">
                      +{c.points} GP
                    </span>
                    <span className="text-xs text-bark/40 capitalize">{c.frequency}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleComplete(c)}
                  disabled={completingId === c._id}
                  className="shrink-0 bg-moss hover:bg-moss-dark disabled:opacity-60 text-white text-sm font-medium rounded-lg px-3 py-2 transition-colors"
                >
                  {completingId === c._id ? "..." : "Complete"}
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent badges */}
      {recentBadges.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-bark mb-3 flex items-center gap-2">
            <Award size={18} className="text-clay" /> Recent Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {recentBadges.map((b) => (
              <Card key={b._id} className="px-4 py-3 flex items-center gap-2">
                <span className="text-lg">🏅</span>
                <div>
                  <p className="text-sm font-medium text-bark">{b.name}</p>
                  <p className="text-xs text-bark/50">{b.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactStat({ label, value }) {
  return (
    <div className="bg-mist rounded-xl px-3 py-3 text-center">
      <p className="font-mono text-lg font-bold text-canopy">{value}</p>
      <p className="text-[11px] text-bark/60 mt-0.5">{label}</p>
    </div>
  );
}
