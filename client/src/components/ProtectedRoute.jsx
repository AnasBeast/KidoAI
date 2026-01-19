import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children }) => {
  const { verifyUser, isAuthenticated, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      // If already authenticated from context, skip verification
      if (isAuthenticated) {
        setIsAuthorized(true);
        setChecking(false);
        return;
      }

      // Check for token and verify
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthorized(false);
        setChecking(false);
        return;
      }

      try {
        const verified = await verifyUser();
        setIsAuthorized(verified);
      } catch (error) {
        setIsAuthorized(false);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [verifyUser, isAuthenticated]);

  // Show loading while checking authentication
  if (checking || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-100 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <LoadingSpinner size="lg" text="Verifying access..." />
        </div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
