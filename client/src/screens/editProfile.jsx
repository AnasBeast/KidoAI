import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { userAPI, getErrorMessage } from "../services/api";
import LoadingSpinner, { ProfileSkeleton } from "../components/LoadingSpinner";
import { VALIDATION } from "../config/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  User,
  Mail,
  Lock,
  Save,
  ArrowLeft,
  Shield,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

const EditProfile = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user, verifyUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const passVerifRef = useRef("");
  const passRef = useRef("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await verifyUser();
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      // If user is not a Google user and wants to change password, verify current password
      if (!user?.googleId && passVerifRef.current?.value) {
        try {
          await userAPI.verifyPassword({
            password: passVerifRef.current.value,
          });
        } catch (error) {
          toast.error("Current password is incorrect");
          setSubmitting(false);
          return;
        }
      }

      // Prepare update data
      const updateData = {};

      if (data.name && data.name !== user?.name) {
        updateData.name = data.name;
      }

      if (passRef.current?.value) {
        if (passRef.current.value.length < VALIDATION.PASSWORD.MIN_LENGTH) {
          toast.warning("New password must be at least 8 characters");
          setSubmitting(false);
          return;
        }
        updateData.password = passRef.current.value;
      }

      // Check if there are changes to update
      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        setSubmitting(false);
        return;
      }

      // Update profile
      await userAPI.updateProfile(updateData);
      await verifyUser();

      toast.success("Profile updated successfully! 🎉");

      // Clear password fields
      if (passVerifRef.current) passVerifRef.current.value = "";
      if (passRef.current) passRef.current.value = "";

      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex-1 flex items-center justify-center py-8 px-4">
          <div className="w-full max-w-md">
            <ProfileSkeleton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex-1 flex items-center justify-center py-8 px-4 relative overflow-hidden">
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
            className="border-0 shadow-2xl overflow-hidden"
          >
            {/* Header Banner */}
            <div className="h-20 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <motion.div
                className="absolute top-4 right-4"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-white/30" />
              </motion.div>
            </div>

            <CardContent className="p-8 -mt-12">
              {/* Avatar */}
              <motion.div
                variants={staggerItem}
                className="flex flex-col items-center mb-6"
              >
                <Avatar size="xl" className="border-4 border-white shadow-xl">
                  <img
                    src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "User",
                      )}&background=8b5cf6&color=fff&size=200`
                    }
                    className="w-full h-full object-cover"
                    alt={user?.name}
                  />
                </Avatar>
                <h1 className="text-2xl font-bold text-neutral-800 mt-4">
                  Edit Profile
                </h1>
                <p className="text-neutral-500 text-sm mt-1">
                  Update your information
                </p>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Field */}
                <motion.div variants={staggerItem}>
                  <label
                    className="block text-sm font-medium text-neutral-700 mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Input
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: VALIDATION.NAME.MIN_LENGTH,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                    type="text"
                    id="name"
                    disabled={submitting}
                    icon={User}
                    error={errors.name?.message}
                  />
                </motion.div>

                {/* Email Field (Read-only) */}
                <motion.div variants={staggerItem}>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    icon={Mail}
                    className="bg-neutral-100 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Email cannot be changed
                  </p>
                </motion.div>

                {/* Password Section - Only for non-Google users */}
                {!user?.googleId && (
                  <motion.div variants={staggerItem}>
                    <div className="border-t border-neutral-200 pt-5 mt-5">
                      <p className="text-sm font-medium text-neutral-700 mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Change Password
                      </p>

                      <div className="space-y-4">
                        <div>
                          <label
                            className="block text-sm font-medium text-neutral-700 mb-2"
                            htmlFor="current-password"
                          >
                            Current Password
                          </label>
                          <Input
                            ref={passVerifRef}
                            type="password"
                            id="current-password"
                            placeholder="Enter current password"
                            disabled={submitting}
                            icon={Shield}
                          />
                        </div>

                        <div>
                          <label
                            className="block text-sm font-medium text-neutral-700 mb-2"
                            htmlFor="new-password"
                          >
                            New Password
                          </label>
                          <Input
                            ref={passRef}
                            type="password"
                            id="new-password"
                            placeholder="Enter new password"
                            disabled={submitting}
                            icon={Lock}
                          />
                          <p className="mt-1 text-xs text-neutral-500">
                            Must be at least 8 characters
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Google Account Notice */}
                {user?.googleId && (
                  <motion.div variants={staggerItem}>
                    <Card
                      variant="filled"
                      className="bg-secondary-50 border border-secondary-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-secondary-600"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-700">
                              Google Account
                            </p>
                            <p className="text-xs text-secondary-600">
                              Password is managed by Google
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Buttons */}
                <motion.div variants={staggerItem} className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => navigate("/profile")}
                    disabled={submitting}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 gap-2 shadow-lg"
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner
                          size="sm"
                          showText={false}
                          color="white"
                        />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;
