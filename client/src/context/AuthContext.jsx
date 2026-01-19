import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { userAPI, getErrorMessage } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const verifyUser = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const { data } = await userAPI.getProfile();

      if (!data.user) {
        setUser(null);
        return false;
      }

      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error("User verification failed:", err);
      setUser(null);
      setError(getErrorMessage(err));

      // If token is invalid, remove it
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
      }

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      verifyUser,
      logout,
      clearError,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, loading, error, verifyUser, logout, clearError, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
