import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { userAPI, getErrorMessage } from "../services/api";
import OauthLogin from "../components/googleLogin";
import Header from "../components/header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Mail, Lock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "../config/animations";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyUser } = useAuth();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.login({ email, password });

      localStorage.setItem("token", response.data.user.token);
      await verifyUser();

      toast.success("Welcome back! 🎉");

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

  return (
    <>
      <Header title="Login" />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex justify-center items-center px-4 py-12">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-72 h-72 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
            animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
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
            className="shadow-2xl shadow-primary-500/10 border-0 overflow-hidden"
          >
            {/* Gradient top border */}
            <div className="h-1.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500" />

            <CardHeader className="text-center pb-2 pt-8">
              <motion.div variants={staggerItem} className="mx-auto mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <motion.div variants={staggerItem}>
                <CardTitle className="text-2xl text-gradient">
                  Welcome Back!
                </CardTitle>
              </motion.div>
              <motion.div variants={staggerItem}>
                <CardDescription className="text-neutral-500">
                  Sign in to continue your learning journey
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="p-8 pt-4">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
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
                      or continue with
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
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                  >
                    Sign up
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

export default LoginForm;
