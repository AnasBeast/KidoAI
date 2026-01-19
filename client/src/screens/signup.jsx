import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { userAPI, getErrorMessage } from "../services/api";
import Header from "../components/header";
import OauthLogin from "../components/googleLogin";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { VALIDATION } from "../config/constants";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyUser } = useAuth();
  const toast = useToast();

  const validateForm = () => {
    if (!name || !email || !password) {
      toast.warning("Please fill in all fields");
      return false;
    }

    if (name.length < VALIDATION.NAME.MIN_LENGTH) {
      toast.warning("Name must be at least 2 characters");
      return false;
    }

    if (!VALIDATION.EMAIL.PATTERN.test(email)) {
      toast.warning("Please enter a valid email address");
      return false;
    }

    if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      toast.warning("Password must be at least 8 characters");
      return false;
    }

    if (!VALIDATION.PASSWORD.PATTERN.test(password)) {
      toast.warning("Password must contain uppercase, lowercase, and a number");
      return false;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await userAPI.signup({ name, email, password });

      localStorage.setItem("token", response.data.user.token);
      await verifyUser();

      toast.success("Account created successfully! 🎉");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 25, label: "Weak", color: "bg-error-500" };
    if (password.length < 8)
      return { strength: 50, label: "Fair", color: "bg-warning-500" };
    if (VALIDATION.PASSWORD.PATTERN.test(password))
      return { strength: 100, label: "Strong", color: "bg-success-500" };
    return { strength: 75, label: "Good", color: "bg-secondary-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Header title="Sign Up" />
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex justify-center items-center px-4 py-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-40 right-20 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-40 left-20 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md relative z-10"
        >
          <Card
            variant="elevated"
            className="shadow-2xl shadow-secondary-500/10 border-0 overflow-hidden"
          >
            {/* Gradient top border */}
            <div className="h-1.5 bg-gradient-to-r from-secondary-500 via-primary-500 to-secondary-500" />

            <CardHeader className="text-center pb-2 pt-8">
              <motion.div variants={staggerItem} className="mx-auto mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary-500/30 mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <motion.div variants={staggerItem}>
                <CardTitle className="text-2xl text-gradient">
                  Create Account
                </CardTitle>
              </motion.div>
              <motion.div variants={staggerItem}>
                <CardDescription className="text-neutral-500">
                  Join KIDOAI Tutor and start learning!
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="p-8 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={staggerItem}>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Full Name
                  </label>
                  <Input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="John Doe"
                    icon={User}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="name@example.com"
                    icon={Mail}
                  />
                </motion.div>

                <motion.div variants={staggerItem}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Password
                  </label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    icon={Lock}
                  />
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${passwordStrength.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.strength}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.strength === 100
                              ? "text-success-600"
                              : passwordStrength.strength >= 75
                                ? "text-secondary-600"
                                : passwordStrength.strength >= 50
                                  ? "text-warning-600"
                                  : "text-error-600"
                          }`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">
                        Must be 8+ characters with uppercase, lowercase, and
                        number
                      </p>
                    </div>
                  )}
                </motion.div>

                <motion.div variants={staggerItem}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-neutral-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="••••••••"
                    icon={KeyRound}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-xs text-success-600 mt-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={staggerItem} className="pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12"
                    size="lg"
                    variant="secondary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.div variants={staggerItem} className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-neutral-400">
                      or sign up with
                    </span>
                  </div>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <OauthLogin />
                </motion.div>

                <motion.p
                  variants={staggerItem}
                  className="text-center text-sm text-neutral-600 mt-6"
                >
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Sign in
                  </Link>
                </motion.p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Signup;
