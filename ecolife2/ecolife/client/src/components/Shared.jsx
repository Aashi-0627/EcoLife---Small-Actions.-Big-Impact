import { Navigate } from "react-router-dom";
import { AlertTriangle, Leaf, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function PageLoader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-moss-dark gap-3">
      <Loader2 className="animate-spin" size={28} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 bg-berry/10 border border-berry/30 text-berry rounded-xl px-4 py-3 mb-4">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <p className="font-medium">Something didn't load correctly</p>
        <p className="opacity-90">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium underline underline-offset-2 shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, body, icon: Icon = Leaf }) {
  return (
    <div className="text-center py-16 text-moss-dark">
      <Icon size={32} className="mx-auto mb-3 opacity-50" />
      <p className="font-semibold text-bark">{title}</p>
      {body && <p className="text-sm mt-1 max-w-sm mx-auto opacity-80">{body}</p>}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-moss/10 shadow-sm ${className}`}>
      {children}
    </div>
  );
}
