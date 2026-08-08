import { useEffect, useState, useCallback, useMemo } from "react";
import { CheckCircle2, Leaf, Bike, Plug, Droplet, Recycle, Users, Lightbulb, Sprout, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ChallengeAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader, EmptyState } from "../components/Shared";

const ICONS = { bottle: Leaf, bike: Bike, plug: Plug, droplet: Droplet, leaf: Leaf, recycle: Recycle, users: Users, lightbulb: Lightbulb, sprout: Sprout, car: Car };
const CATEGORIES = ["all", "transport", "energy", "water", "waste", "biodiversity", "community"];

export default function Challenges() {
  const { refreshUser } = useAuth();
  const { push } = useToast();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState("all");
  const [completingId, setCompletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ChallengeAPI.list();
      setChallenges(data.challenges);
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
      push({ title: "Challenge complete!", message: `+${result.completion.pointsAwarded} Green Points earned.`, emoji: "🌿" });
      if (result.newBadges?.length) {
        result.newBadges.forEach((nb) =>
          push({ variant: "badge", title: "Badge unlocked!", message: nb.badge.name, emoji: "🏅" })
        );
      }
      await Promise.all([refreshUser(), load()]);
    } catch (err) {
      push({ variant: "error", title: "Couldn't complete challenge", message: err.message, emoji: "⚠️" });
    } finally {
      setCompletingId(null);
    }
  };

  const filtered = useMemo(
    () => (category === "all" ? challenges : challenges.filter((c) => c.category === category)),
    [challenges, category]
  );

  if (loading) return <PageLoader label="Loading challenges..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1">Challenges</h1>
      <p className="text-moss-dark text-sm mb-6">Complete eco-actions to earn Green Points and grow your score.</p>

      <ErrorBanner message={error} onRetry={load} />

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize transition-colors ${
              category === cat ? "bg-moss text-white" : "bg-white border border-moss/15 text-moss-dark hover:bg-moss/5"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No challenges in this category" body="Try a different category filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const Icon = ICONS[c.icon] || Leaf;
            return (
              <Card key={c._id} className={`p-5 flex flex-col gap-3 ${c.completedNow ? "opacity-70" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-moss/10 flex items-center justify-center text-moss">
                    <Icon size={20} />
                  </span>
                  <span className="text-xs font-mono bg-lichen/30 text-moss-dark rounded-full px-2 py-0.5">
                    +{c.points} GP
                  </span>
                </div>
                <div>
                  <p className="font-medium text-bark">{c.title}</p>
                  <p className="text-xs text-bark/60 mt-1">{c.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-bark/50 capitalize">
                  <span>{c.category} · {c.frequency}</span>
                  <span>{c.co2SavedKg} kg CO₂e</span>
                </div>
                <button
                  onClick={() => handleComplete(c)}
                  disabled={c.completedNow || completingId === c._id}
                  className={`mt-1 w-full rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    c.completedNow
                      ? "bg-moss/10 text-moss-dark cursor-not-allowed"
                      : "bg-moss hover:bg-moss-dark text-white"
                  }`}
                >
                  {c.completedNow ? (
                    <>
                      <CheckCircle2 size={16} /> Completed
                    </>
                  ) : completingId === c._id ? (
                    "Saving..."
                  ) : (
                    "Complete challenge"
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
