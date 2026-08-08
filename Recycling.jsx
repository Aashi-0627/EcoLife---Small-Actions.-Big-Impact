import { useEffect, useState, useCallback } from "react";
import { Search, Recycle } from "lucide-react";
import { RecyclingAPI } from "../api/endpoints";
import { Card, ErrorBanner, EmptyState } from "../components/Shared";

const CATEGORIES = ["all", "plastic", "paper", "glass", "metal", "e-waste", "organic", "hazardous"];

export default function Recycling() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async (q, cat) => {
    setError(null);
    try {
      const data = await RecyclingAPI.search(q, cat === "all" ? undefined : cat);
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query, category), 250);
    return () => clearTimeout(t);
  }, [query, category, load]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1 flex items-center gap-2">
        <Recycle className="text-moss" /> Recycling Guide
      </h1>
      <p className="text-moss-dark text-sm mb-6">Search any item to find out how to dispose of it correctly.</p>

      <ErrorBanner message={error} onRetry={() => load(query, category)} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-bark/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. 'battery', 'bottle', 'cardboard'..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-moss/20 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-moss/20 px-3 py-2.5 text-sm capitalize"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No matching items" body="Try a different search term or category." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item._id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-bark">{item.name}</p>
                <span className="text-xs bg-moss/10 text-moss-dark rounded-full px-2 py-0.5 capitalize">
                  {item.category}
                </span>
              </div>
              <p className="text-sm text-bark/70">{item.instructions}</p>
              <p className="text-xs text-bark/50 mt-2">Bin: <span className="font-medium">{item.binColor}</span></p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
