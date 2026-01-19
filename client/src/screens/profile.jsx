import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { ProfileSkeleton } from "../components/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { BADGES } from "../config/constants";
import {
  User,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Percent,
  Edit,
  BarChart3,
  Star,
  Sparkles,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

const ProfilePage = () => {
  const { user, verifyUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const toast = useToast();

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

  const stats = useMemo(() => {
    if (!user?.answers)
      return { correct: 0, incorrect: 0, total: 0, accuracy: 0 };

    const correct = user.answers.filter((a) => a.isValid).length;
    const incorrect = user.answers.filter((a) => !a.isValid).length;
    const total = user.answers.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    return { correct, incorrect, total, accuracy };
  }, [user?.answers]);

  const earnedBadges = useMemo(() => {
    if (!user?.score) return [];

    return BADGES.filter((badge) => user.score >= badge.requirement);
  }, [user?.score]);

  const nextBadge = useMemo(() => {
    if (!user?.score) return BADGES[0];

    return (
      BADGES.find((badge) => user.score < badge.requirement) ||
      BADGES[BADGES.length - 1]
    );
  }, [user?.score]);

  const progressToNextBadge = useMemo(() => {
    if (!user?.score || !nextBadge) return 0;

    const prevBadge = earnedBadges[earnedBadges.length - 1];
    const prevReq = prevBadge?.requirement || 0;
    const nextReq = nextBadge.requirement;

    return Math.min(
      100,
      Math.round(((user.score - prevReq) / (nextReq - prevReq)) * 100),
    );
  }, [user?.score, nextBadge, earnedBadges]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <ProfileSkeleton />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const statCards = [
    {
      title: "Total Questions",
      value: stats.total,
      icon: Target,
      color: "primary",
    },
    {
      title: "Correct",
      value: stats.correct,
      icon: CheckCircle,
      color: "success",
    },
    {
      title: "Incorrect",
      value: stats.incorrect,
      icon: XCircle,
      color: "error",
    },
    {
      title: "Accuracy",
      value: `${stats.accuracy}%`,
      icon: Percent,
      color: "secondary",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
        <motion.div
          className="max-w-2xl mx-auto space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Profile Card */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" className="overflow-hidden border-0">
              {/* Header Banner */}
              <div className="h-28 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white/30" />
                </motion.div>
              </div>

              {/* Profile Info */}
              <CardContent className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-14">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <Avatar
                      size="xl"
                      className="border-4 border-white shadow-xl"
                    >
                      <img
                        src={
                          user?.avatar ||
                          "https://ui-avatars.com/api/?name=" +
                            encodeURIComponent(user?.name || "User") +
                            "&background=8b5cf6&color=fff&size=200"
                        }
                        className="w-full h-full object-cover"
                        alt={user?.name}
                      />
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-2xl font-bold text-neutral-800 mt-4">
                    {user?.name}
                  </h2>
                  <p className="text-neutral-500">{user?.email}</p>

                  {/* Score Badge */}
                  <motion.div whileHover={{ scale: 1.05 }} className="mt-4">
                    <Badge
                      variant="default"
                      className="px-6 py-3 text-lg bg-gradient-to-r from-primary-500 to-secondary-500 border-0 shadow-lg"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      {user?.score || 0} Points
                    </Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card hover className="border-0 shadow-md">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-10 h-10 mx-auto rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-2`}
                    >
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                    <p className="text-2xl font-bold text-neutral-800">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-500">{stat.title}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Badges Section */}
          <motion.div variants={staggerItem}>
            <Card variant="elevated" className="border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning-500" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earnedBadges.length > 0 ? (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {earnedBadges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative"
                      >
                        <motion.div
                          className="text-4xl cursor-pointer"
                          whileHover={{ scale: 1.2, rotate: 10 }}
                        >
                          {badge.icon}
                        </motion.div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-neutral-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {badge.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">
                      Answer questions to earn your first badge! 🌟
                    </p>
                  </div>
                )}

                {/* Progress to Next Badge */}
                {nextBadge && user?.score < nextBadge.requirement && (
                  <Card variant="filled" className="bg-neutral-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-neutral-600 font-medium">
                          Next: {nextBadge.name}
                        </span>
                        <span className="text-2xl">{nextBadge.icon}</span>
                      </div>
                      <Progress
                        value={progressToNextBadge}
                        color="primary"
                        className="mb-2"
                      />
                      <p className="text-xs text-neutral-500 text-center">
                        {user?.score || 0} / {nextBadge.requirement} points
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/edit-profile" className="flex-1">
              <Button className="w-full gap-2 shadow-lg">
                <Edit className="w-5 h-5" />
                Edit Profile
              </Button>
            </Link>
            <Link to="/leaderboard" className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <BarChart3 className="w-5 h-5" />
                View Leaderboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
