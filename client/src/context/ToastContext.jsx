import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, ...toast }]);
      setTimeout(() => dismiss(id), toast.duration || 4500);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[min(92vw,380px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-2xl shadow-xl border px-4 py-3 flex items-start gap-3 animate-[slideIn_0.25s_ease-out] ${
              t.variant === "error"
                ? "bg-berry text-white border-berry"
                : t.variant === "badge"
                ? "bg-canopy text-lichen border-lichen"
                : "bg-white text-bark border-moss/20"
            }`}
          >
            <span className="text-xl leading-none mt-0.5">{t.emoji || "🌱"}</span>
            <div className="flex-1 min-w-0">
              {t.title && <p className="font-semibold text-sm">{t.title}</p>}
              <p className="text-sm opacity-90 break-words">{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="opacity-60 hover:opacity-100 text-sm"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
