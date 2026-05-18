import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "auth-token";

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);   // true while checking stored token
  const [error, setError]     = useState(null);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
  const clearToken = () => localStorage.removeItem(TOKEN_KEY);

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data: balanceData } = await api.get("/economy/balance");
      const { data: profileData } = await api.get("/user/profile");
      if (balanceData.success) {
        setUser(prev => ({
          ...prev,
          ...profileData,
          coinBalance:     parseFloat(balanceData.balance),
          level:           balanceData.level,
          reputationScore: balanceData.reputationScore,
          lastCheckIn:     balanceData.lastCheckIn,
          checkInStreak:   balanceData.checkInStreak,
          username:        profileData.name || prev?.username
        }));
      }
    } catch (err) {
      console.error("FAILED TO FETCH USER PROFILE:", err);
    }
  }, []);

  // ── On Mount: Restore session from localStorage ────────────────────────────
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setLoading(false); return; }

      try {
        // Decode payload to pre-populate state instantly (no round-trip wait)
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 < Date.now()) {
          clearToken();
          setLoading(false);
          return;
        }
        setUser({ id: payload.userId, email: payload.email, role: payload.role });
        await fetchUserProfile();
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [fetchUserProfile]);

  // ── Auth Actions ───────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    const { data } = await api.post("/auth/login", { email, password });
    if (!data.success) throw new Error(data.error);
    saveToken(data.token);
    setUser({ ...data.user, username: data.user.name });
    await fetchUserProfile();
    return data;
  };

  const register = async (name, email, password) => {
    setError(null);
    const { data } = await api.post("/auth/register", { name, email, password });
    if (!data.success) throw new Error(data.error);
    return data;
  };

  const verifyEmail = async (email, code) => {
    setError(null);
    const { data } = await api.post("/auth/verify", { email, code });
    if (!data.success) throw new Error(data.error);
    saveToken(data.token);
    setUser({ ...data.user, username: data.user.name });
    await fetchUserProfile();
    return data;
  };

  const googleLogin = async (credentialResponse) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/google", { token: credentialResponse.credential });
      if (!data.success) throw new Error(data.error || "Google login failed");
      saveToken(data.token);
      setUser({ ...data.user, username: data.user.name });
      await fetchUserProfile();
      return data;
    } catch (err) {
      setError(err.message);
      console.error("Google login error:", err);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setError(null);
  };

  const updateBalance = (newBalance) =>
    setUser(prev => ({ ...prev, coinBalance: parseFloat(newBalance) }));

  const updateUserFields = (fields) =>
    setUser(prev => ({ ...prev, ...fields }));

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      login, logout, register, verifyEmail, googleLogin,
      updateBalance, updateUserFields, fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

