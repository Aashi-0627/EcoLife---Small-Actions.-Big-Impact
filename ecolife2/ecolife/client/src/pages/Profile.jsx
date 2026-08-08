import { useEffect, useState, useCallback } from "react";
import { User, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { UserAPI, CampusAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader } from "../components/Shared";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { push } = useToast();
  const [stats, setStats] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [name, setName] = useState(user?.name || "");
  const [campusId, setCampusId] = useState(user?.campusId || "");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, campusData] = await Promise.all([UserAPI.stats(), CampusAPI.list()]);
      setStats(statsData);
      setCampuses(campusData.campuses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setName(user?.name || "");
    setCampusId(user?.campusId || "");
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await UserAPI.update({ name, campusId: campusId || null });
      await Promise.all([refreshUser(), load()]);
      push({ title: "Profile updated", message: "Your changes were saved.", emoji: "✅" });
    } catch (err) {
      push({ variant: "error", title: "Couldn't save profile", message: err.message, emoji: "⚠️" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1 flex items-center gap-2">
        <User className="text-moss" /> Profile
      </h1>
      <p className="text-moss-dark text-sm mb-6">Manage your account and see your lifetime stats.</p>

      <ErrorBanner message={error} onRetry={load} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Stat label="Green Points" value={user?.greenPoints ?? 0} />
        <Stat label="Challenges Done" value={stats?.totalChallengesCompleted ?? 0} />
        <Stat label="Badges Earned" value={stats?.badgesEarned ?? 0} />
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-bark mb-4">Account details</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-bark mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-moss/20 px-3 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-1">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full rounded-lg border border-moss/10 bg-mist px-3 py-2.5 text-sm text-bark/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bark mb-1">Campus</label>
            <select
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              className="w-full rounded-lg border border-moss/20 px-3 py-2.5 text-sm"
            >
              <option value="">No campus selected</option>
              {campuses.map((c) => (
                <option key={c._id} value={c._id}>{c.name} — {c.city}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 bg-moss hover:bg-moss-dark disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card className="p-4 text-center">
      <p className="font-mono text-2xl font-bold text-moss">{value}</p>
      <p className="text-xs text-bark/60 mt-1">{label}</p>
    </Card>
  );
}
