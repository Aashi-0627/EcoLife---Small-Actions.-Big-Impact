import { useEffect, useState, useCallback } from "react";
import { Trophy, Users, Medal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { CampusAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader, EmptyState } from "../components/Shared";

const MEDAL_COLORS = ["text-clay", "text-bark/40", "text-clay-dark"];

export default function CampusLeague() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { leaderboard } = await CampusAPI.leaderboard();
      setLeaderboard(leaderboard);
      if (user?.campusId) {
        const d = await CampusAPI.detail(user.campusId);
        setDetail(d);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.campusId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader label="Loading campus league..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1 flex items-center gap-2">
        <Trophy className="text-clay" /> Campus Green League
      </h1>
      <p className="text-moss-dark text-sm mb-6">Campuses compete on total Green Points earned by their students.</p>

      <ErrorBanner message={error} onRetry={load} />

      {leaderboard.length === 0 ? (
        <EmptyState title="No campuses yet" />
      ) : (
        <Card className="overflow-hidden mb-6">
          <ul>
            {leaderboard.map((c, i) => (
              <li
                key={c._id}
                className={`flex items-center justify-between px-5 py-4 border-b border-moss/8 last:border-0 ${
                  c._id === user?.campusId ? "bg-lichen/15" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-bold text-lg w-8 text-center ${MEDAL_COLORS[i] || "text-bark/50"}`}>
                    {i < 3 ? <Medal size={20} className="inline" /> : `#${c.rank}`}
                  </span>
                  <div>
                    <p className="font-medium text-bark">{c.name}</p>
                    <p className="text-xs text-bark/50">{c.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-moss">{c.totalPoints}</p>
                  <p className="text-xs text-bark/50 flex items-center gap-1 justify-end">
                    <Users size={12} /> {c.memberCount}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {detail && (
        <Card className="p-5">
          <h2 className="font-semibold text-bark mb-3">{detail.campus.name} — Top Contributors</h2>
          {detail.topContributors.length === 0 ? (
            <EmptyState title="No contributors yet" body="Be the first to earn points for this campus." />
          ) : (
            <ol className="space-y-2">
              {detail.topContributors.map((u, i) => (
                <li key={u._id} className="flex items-center justify-between text-sm">
                  <span className="text-bark">
                    <span className="font-mono text-bark/40 mr-2">{i + 1}.</span>
                    {u.name} {u._id === user?._id && <span className="text-moss text-xs">(you)</span>}
                  </span>
                  <span className="font-mono text-moss-dark">{u.greenPoints} GP</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </div>
  );
}
