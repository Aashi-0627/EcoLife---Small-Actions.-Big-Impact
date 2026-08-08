import { useEffect, useState, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { CarbonAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader, EmptyState } from "../components/Shared";

const CATEGORY_OPTIONS = {
  transport: ["car_petrol_km", "car_diesel_km", "car_electric_km", "bus_km", "train_km", "bike_km", "walk_km", "flight_short_km", "flight_long_km"],
  energy: ["electricity_kwh", "lpg_kg", "natural_gas_m3"],
  water: ["water_liter"],
  waste: ["landfill_kg", "recycled_kg", "composted_kg"],
};

const CATEGORY_COLORS = { transport: "#2F6B4F", energy: "#E8A34C", water: "#3F8A67", waste: "#C65B4E" };
const RANGES = [7, 30, 90];

export default function Analytics() {
  const { push } = useToast();
  const [range, setRange] = useState(30);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ category: "transport", activityType: "car_petrol_km", quantity: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async (r) => {
    setLoading(true);
    setError(null);
    try {
      const data = await CarbonAPI.history(r);
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [range, load]);

  const handleCategoryChange = (category) => {
    setForm({ category, activityType: CATEGORY_OPTIONS[category][0], quantity: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) {
      push({ variant: "error", title: "Invalid quantity", message: "Enter a positive number.", emoji: "⚠️" });
      return;
    }
    setSubmitting(true);
    try {
      await CarbonAPI.log({ category: form.category, activityType: form.activityType, quantity: qty });
      push({ title: "Activity logged", message: "Your carbon footprint entry was saved.", emoji: "📊" });
      setForm((f) => ({ ...f, quantity: "" }));
      await load(range);
    } catch (err) {
      push({ variant: "error", title: "Couldn't log activity", message: err.message, emoji: "⚠️" });
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = history
    ? Object.entries(history.byDate).map(([date, co2e]) => ({ date: date.slice(5), co2e }))
    : [];
  const pieData = history
    ? Object.entries(history.byCategory).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1">Carbon Analytics</h1>
      <p className="text-moss-dark text-sm mb-6">Log activities and track your carbon footprint over time.</p>

      <ErrorBanner message={error} onRetry={() => load(range)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-bark mb-4">Log an activity</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-bark/70 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full rounded-lg border border-moss/20 px-3 py-2 text-sm capitalize"
              >
                {Object.keys(CATEGORY_OPTIONS).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark/70 mb-1">Activity</label>
              <select
                value={form.activityType}
                onChange={(e) => setForm((f) => ({ ...f, activityType: e.target.value }))}
                className="w-full rounded-lg border border-moss/20 px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS[form.category].map((a) => (
                  <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-bark/70 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-full rounded-lg border border-moss/20 px-3 py-2 text-sm"
                placeholder="e.g. 5"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 bg-moss hover:bg-moss-dark disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
            >
              <Plus size={16} /> {submitting ? "Saving..." : "Log activity"}
            </button>
          </form>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-bark">CO₂e over time</h2>
              <div className="flex gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      range === r ? "bg-moss text-white" : "bg-mist text-moss-dark"
                    }`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <PageLoader label="Loading history..." />
            ) : chartData.length === 0 ? (
              <EmptyState title="No activity logged yet" body="Log your first activity to see your footprint trend." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2F6B4F" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2F6B4F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#8a9a90" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#8a9a90" />
                    <Tooltip formatter={(v) => [`${v} kg CO₂e`, "Emissions"]} />
                    <Area type="monotone" dataKey="co2e" stroke="#2F6B4F" fill="url(#co2Gradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-sm text-bark/70 mt-2 font-mono">
                  Total: {history.totalCo2e} kg CO₂e over {range} days
                </p>
              </>
            )}
          </Card>

          {pieData.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold text-bark mb-4">By category</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || "#2F6B4F"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} kg CO₂e`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pieData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-bark/70 capitalize">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[d.name] || "#2F6B4F" }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
