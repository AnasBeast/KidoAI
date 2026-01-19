import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import { userAPI, getErrorMessage } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const OauthLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyUser } = useAuth();
  const toast = useToast();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);

    try {
      const token = credentialResponse.credential;
      const decoded = jwtDecode(token);

      const response = await userAPI.verifyOAuth({ token });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        await verifyUser();

        toast.success(`Welcome, ${decoded.name}! 🎉`);

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <LoadingSpinner size="sm" text="Signing in with Google..." />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
};

export default OauthLogin;
