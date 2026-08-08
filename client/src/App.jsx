import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ProtectedRoute, PageLoader } from "./components/Shared";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Analytics = lazy(() => import("./pages/Analytics"));
const CampusLeague = lazy(() => import("./pages/CampusLeague"));
const Recycling = lazy(() => import("./pages/Recycling"));
const EcoTips = lazy(() => import("./pages/EcoTips"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-mist">
      <Navbar />
      {children}
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/challenges"
        element={
          <ProtectedRoute>
            <AppLayout><Challenges /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AppLayout><Analytics /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/campus-league"
        element={
          <ProtectedRoute>
            <AppLayout><CampusLeague /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recycling"
        element={
          <ProtectedRoute>
            <AppLayout><Recycling /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/eco-tips"
        element={
          <ProtectedRoute>
            <AppLayout><EcoTips /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <AppLayout><Achievements /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout><Profile /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout><NotFound /></AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </HashRouter>
  );
}
