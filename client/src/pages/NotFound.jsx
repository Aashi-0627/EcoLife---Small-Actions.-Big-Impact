import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Compass size={40} className="text-moss/50 mb-4" />
      <h1 className="font-display text-2xl font-semibold text-canopy mb-1">Page not found</h1>
      <p className="text-bark/60 text-sm mb-5">The page you're looking for doesn't exist or was moved.</p>
      <Link
        to="/dashboard"
        className="bg-moss hover:bg-moss-dark text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
