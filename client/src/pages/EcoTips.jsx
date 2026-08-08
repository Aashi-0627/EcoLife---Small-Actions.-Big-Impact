import { useEffect, useState, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { EcoTipAPI } from "../api/endpoints";
import { Card, ErrorBanner, PageLoader, EmptyState } from "../components/Shared";

const CATEGORIES = ["all", "energy", "water", "waste", "transport", "biodiversity"];

export default function EcoTips() {
  const [category, setCategory] = useState("all");
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (cat) => {
    setLoading(true);
    setError(null);
    try {
      const data = await EcoTipAPI.list(cat === "all" ? undefined : cat);
      setTips(data.tips);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(category);
  }, [category, load]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-canopy mb-1 flex items-center gap-2">
        <Lightbulb className="text-clay" /> Eco Tips
      </h1>
      <p className="text-moss-dark text-sm mb-6">Small habits that add up to a big environmental impact.</p>

      <ErrorBanner message={error} onRetry={() => load(category)} />

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm capitalize ${
              category === c ? "bg-moss text-white" : "bg-white border border-moss/15 text-moss-dark"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader label="Loading tips..." />
      ) : tips.length === 0 ? (
        <EmptyState title="No tips in this category" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <Card key={tip._id} className="p-4">
              <span className="text-xs uppercase tracking-wide text-moss font-medium">{tip.category}</span>
              <p className="font-medium text-bark mt-1">{tip.title}</p>
              <p className="text-sm text-bark/70 mt-1">{tip.body}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
