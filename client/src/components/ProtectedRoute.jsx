import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const {
    verifyUser,
    isAuthenticated,
    loading: authLoading,
    initialized,
  } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasChecked.current) return;

    const checkAuth = async () => {
      // If already authenticated from context, skip verification
      if (isAuthenticated && initialized) {
        setIsAuthorized(true);
        setChecking(false);
        hasChecked.current = true;
        return;
      }

      // Check for token
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        setChecking(false);
        hasChecked.current = true;
        return;
      }

      try {
        const verified = await verifyUser();
        setIsAuthorized(!!verified);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthorized(false);
      } finally {
        setChecking(false);
        hasChecked.current = true;
      }
    };

    checkAuth();
  }, [verifyUser, isAuthenticated, initialized]);

  // Reset check flag when location changes
  useEffect(() => {
    return () => {
      hasChecked.current = false;
    };
  }, [location.pathname]);

  // Show loading while checking authentication
  if (checking || (authLoading && !initialized)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center border border-white/20">
          <LoadingSpinner size="lg" text="Verifying access..." />
        </div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
