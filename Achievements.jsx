import { useEffect, useState, useCallback } from "react";
import { Award, Lock } from "lucide-react";
import { BadgeAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader } from "../components/Shared";

export default function Achievements() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BadgeAPI.list();
      setBadges(data.badges);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageLoader label="Loading achievements..." />;

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1 flex items-center gap-2">
        <Award className="text-clay" /> Achievements
      </h1>
      <p className="text-moss-dark text-sm mb-6">
        {earnedCount} of {badges.length} badges earned
      </p>

      <ErrorBanner message={error} onRetry={load} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {badges.map((b) => {
          const pct = Math.min(100, Math.round((b.progress / b.target) * 100));
          return (
            <Card key={b._id} className={`p-4 ${b.earned ? "" : "opacity-80"}`}>
              <div className="flex items-start gap-3">
                <span
                  className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-lg ${
                    b.earned ? "bg-lichen/30 text-canopy" : "bg-bark/5 text-bark/30"
                  }`}
                >
                  {b.earned ? "🏅" : <Lock size={18} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-bark">{b.name}</p>
                  <p className="text-xs text-bark/60 mt-0.5">{b.description}</p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-moss/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${b.earned ? "bg-lichen-dark" : "bg-moss"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-bark/50 mt-1 font-mono">
                      {b.progress} / {b.target}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
