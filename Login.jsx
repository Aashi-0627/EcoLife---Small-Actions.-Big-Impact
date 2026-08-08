import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Leaf, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register, demoLogin, authError } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSubmitting(true);
    const ok =
      mode === "login"
        ? await login(form.email, form.password)
        : await register({ name: form.name, email: form.email, password: form.password });
    setSubmitting(false);
    if (ok) navigate("/dashboard");
  };

  const handleDemo = async () => {
    setLocalError(null);
    setSubmitting(true);
    const ok = await demoLogin();
    setSubmitting(false);
    if (ok) navigate("/dashboard");
  };

  const errorToShow = localError || authError;

  return (
    <div className="min-h-screen bg-canopy flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-moss/20 mb-4">
            <Leaf className="text-lichen" size={28} />
          </div>
          <h1 className="font-display text-3xl text-white font-semibold">EcoLife</h1>
          <p className="text-mist/60 text-sm mt-1">Small Actions. Big Impact.</p>
        </div>

        <div className="bg-mist rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex bg-canopy/5 rounded-xl p-1 mb-6">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "login" ? "bg-white shadow-sm text-canopy" : "text-moss-dark"
              }`}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "register" ? "bg-white shadow-sm text-canopy" : "text-moss-dark"
              }`}
              onClick={() => setMode("register")}
            >
              Sign up
            </button>
          </div>

          {errorToShow && (
            <div className="bg-berry/10 text-berry text-sm rounded-lg px-3 py-2 mb-4 border border-berry/20">
              {errorToShow}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-bark mb-1" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={update("name")}
                  className="w-full rounded-lg border border-moss/20 px-3 py-2.5 text-sm focus:border-moss outline-none"
                  placeholder="Asha Rao"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-bark mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={update("email")}
                className="w-full rounded-lg border border-moss/20 px-3 py-2.5 text-sm focus:border-moss outline-none"
                placeholder="you@campus.edu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bark mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
                className="w-full rounded-lg border border-moss/20 px-3 py-2.5 text-sm focus:border-moss outline-none"
                placeholder="At least 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-moss hover:bg-moss-dark disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-moss/15 flex-1" />
            <span className="text-xs text-moss-dark/70">or</span>
            <div className="h-px bg-moss/15 flex-1" />
          </div>

          <button
            onClick={handleDemo}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-lichen hover:bg-lichen-dark disabled:opacity-60 text-canopy font-medium rounded-lg py-2.5 text-sm transition-colors"
          >
            <Sparkles size={16} />
            Try instant demo login
          </button>
          <p className="text-xs text-center text-moss-dark/60 mt-3">
            No sign-up needed — explore EcoLife with a live demo account.
          </p>
        </div>
      </div>
    </div>
  );
}
