import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Trophy,
  Recycle,
  Lightbulb,
  Award,
  User,
  LogOut,
  Menu,
  X,
  Flame,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/challenges", label: "Challenges", icon: ListChecks },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/campus-league", label: "Campus League", icon: Trophy },
  { to: "/recycling", label: "Recycling Guide", icon: Recycle },
  { to: "/eco-tips", label: "Eco Tips", icon: Lightbulb },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 bg-canopy text-mist">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold text-lichen">EcoLife</span>
          <span className="hidden md:inline text-xs text-mist/60 border-l border-mist/20 pl-3">
            Small Actions. Big Impact.
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-moss text-white"
                    : "text-mist/75 hover:text-white hover:bg-canopy-light"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <Flame size={16} className="text-clay" />
              <span className="font-mono">{user.currentStreak}d</span>
              <span className="text-mist/40">|</span>
              <span className="font-mono text-lichen">{user.greenPoints} GP</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 text-sm text-mist/75 hover:text-white transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-canopy-light"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-canopy-light px-4 py-3 flex flex-col gap-1" aria-label="Mobile">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  isActive ? "bg-moss text-white" : "text-mist/80 hover:bg-canopy-light"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-mist/80 hover:bg-canopy-light"
          >
            <LogOut size={16} /> Logout
          </button>
        </nav>
      )}
    </header>
  );
}
