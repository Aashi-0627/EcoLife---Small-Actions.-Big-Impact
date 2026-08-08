import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthAPI } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const loadFromToken = useCallback(async () => {
    const token = localStorage.getItem("ecolife_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { user } = await AuthAPI.me();
      setUser(user);
    } catch {
      localStorage.removeItem("ecolife_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh persistence: rehydrate session from stored JWT on every page load.
  useEffect(() => {
    loadFromToken();
  }, [loadFromToken]);

  const handleAuthSuccess = (data) => {
    localStorage.setItem("ecolife_token", data.token);
    setUser(data.user);
    setAuthError(null);
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await AuthAPI.login({ email, password });
      handleAuthSuccess(data);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const register = async (payload) => {
    setAuthError(null);
    try {
      const data = await AuthAPI.register(payload);
      handleAuthSuccess(data);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const demoLogin = async () => {
    setAuthError(null);
    try {
      const data = await AuthAPI.demoLogin();
      handleAuthSuccess(data);
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("ecolife_token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { user } = await AuthAPI.me();
      setUser(user);
    } catch {
      // token became invalid mid-session; the axios interceptor handles redirect
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, authError, login, register, demoLogin, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
