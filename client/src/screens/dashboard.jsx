import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { StatsSkeleton } from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../services/api";
import { BADGES, APP_ROUTES, ANIMATIONS } from "../config/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Trophy,
  Target,
  FileQuestion,
  Flame,
  Gamepad2,
  Brain,
  Crown,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

const Dashboard = () => {
  const { user, verifyUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const calculateStats = useCallback((userData) => {
    const answers = userData.answers || [];
    const correctAnswers = answers.filter((a) => a.isValid).length;
    const totalAnswers = answers.length;
    const accuracy =
      totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(1) : 0;

    // Calculate current streak
    let streak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isValid) streak++;
      else break;
    }

    // Calculate badges earned based on requirements
    const badges = BADGES.filter((badge) => {
      switch (badge.id) {
        case "first_answer":
          return totalAnswers >= 1;
        case "perfect_streak":
          return streak >= 10;
        case "dedicated":
          return totalAnswers >= 50;
        case "century":
          return userData.score >= 100;
        case "master":
          return userData.score >= 1000;
        default:
          return userData.score >= badge.requirement;
      }
    });

    return {
      score: userData.score || 0,
      totalAnswers,
      correctAnswers,
      incorrectAnswers: totalAnswers - correctAnswers,
      accuracy,
      streak,
      badges,
      difficulty: userData.difficulty || "easy",
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await verifyUser();

        if (userData) {
          const calculatedStats = calculateStats(userData);
          setStats(calculatedStats);
          setEarnedBadges(calculatedStats.badges);

          // Get recent answers (last 5)
          const answers = userData.answers || [];
          setRecentAnswers(answers.slice(-5).reverse());
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [verifyUser, calculateStats, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Header title="Dashboard" />
        <div className="pt-24 px-4 max-w-6xl mx-auto">
          <StatsSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Score",
      value: stats?.score || 0,
      icon: Trophy,
      color: "primary",
      subtitle: "Keep it up!",
    },
    {
      label: "Accuracy",
      value: `${stats?.accuracy || 0}%`,
      icon: Target,
      color: "success",
      subtitle: `${stats?.correctAnswers}/${stats?.totalAnswers} correct`,
    },
    {
      label: "Questions",
      value: stats?.totalAnswers || 0,
      icon: FileQuestion,
      color: "secondary",
      subtitle: "answered",
    },
    {
      label: "Current Streak",
      value: stats?.streak || 0,
      icon: Flame,
      color: "warning",
      subtitle: "correct in a row",
    },
  ];

  const quickActions = [
    {
      to: APP_ROUTES.CHALLENGES,
      icon: Gamepad2,
      label: "Play Games",
      color: "from-primary-500 to-primary-600",
      bgColor: "bg-primary-50 hover:bg-primary-100",
    },
    {
      to: APP_ROUTES.QUIZZ,
      icon: Brain,
      label: "Quick Quiz",
      color: "from-secondary-500 to-secondary-600",
      bgColor: "bg-secondary-50 hover:bg-secondary-100",
    },
    {
      to: APP_ROUTES.LEADERBOARD,
      icon: Crown,
      label: "Leaderboard",
      color: "from-warning-500 to-warning-600",
      bgColor: "bg-warning-50 hover:bg-warning-100",
    },
    {
      to: APP_ROUTES.PROFILE,
      icon: User,
      label: "My Profile",
      color: "from-success-500 to-success-600",
      bgColor: "bg-success-50 hover:bg-success-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header title="Dashboard" />

      <motion.div
        className="pt-8 pb-20 px-4 max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Welcome Section */}
        <motion.div variants={staggerItem} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-4xl"
            >
              👋
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-800">
              Welcome back,{" "}
              <span className="text-gradient">
                {user?.name?.split(" ")[0] || "Learner"}
              </span>
              !
            </h1>
          </div>
          <p className="text-neutral-600 ml-14">
            Here's your learning progress overview
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hover
                className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                    stat.color === "primary"
                      ? "from-primary-500 to-primary-600"
                      : stat.color === "success"
                        ? "from-success-500 to-success-600"
                        : stat.color === "secondary"
                          ? "from-secondary-500 to-secondary-600"
                          : "from-warning-500 to-warning-600"
                  }`}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-neutral-500 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-neutral-800">
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        stat.color === "primary"
                          ? "bg-primary-100 text-primary-600"
                          : stat.color === "success"
                            ? "bg-success-100 text-success-600"
                            : stat.color === "secondary"
                              ? "bg-secondary-100 text-secondary-600"
                              : "bg-warning-100 text-warning-600"
                      }`}
                    >
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Progress Bar */}
        <motion.div variants={staggerItem}>
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                  <span className="font-semibold text-neutral-700">
                    Daily Progress
                  </span>
                </div>
                <span className="text-sm text-neutral-500">
                  {stats?.totalAnswers || 0}/20 questions
                </span>
              </div>
              <Progress
                value={Math.min(((stats?.totalAnswers || 0) / 20) * 100, 100)}
                color="gradient"
                className="h-3"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Badges Section */}
          <motion.div variants={staggerItem}>
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Award className="w-5 h-5 text-warning-500" />
                  Badges Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                {earnedBadges.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {earnedBadges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        className="text-center p-4 bg-gradient-to-br from-warning-50 to-primary-50 rounded-xl border border-warning-100"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * index, type: "spring" }}
                        whileHover={{ scale: 1.05, y: -2 }}
                      >
                        <span className="text-3xl">{badge.icon}</span>
                        <p className="text-xs font-medium text-neutral-700 mt-2">
                          {badge.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">
                      Complete challenges to earn badges!
                    </p>
                  </div>
                )}

                {/* Locked Badges Preview */}
                <div className="mt-6 pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400 mb-3 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Next badges to unlock:
                  </p>
                  <div className="flex gap-2">
                    {BADGES.filter(
                      (b) => !earnedBadges.find((eb) => eb.id === b.id),
                    )
                      .slice(0, 3)
                      .map((badge) => (
                        <div
                          key={badge.id}
                          className="text-center p-2 bg-neutral-100 rounded-xl opacity-60"
                        >
                          <span className="text-xl grayscale">
                            {badge.icon}
                          </span>
                          <p className="text-xs text-neutral-400 mt-1">
                            {badge.name}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={staggerItem}>
            <Card className="h-full border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-5 h-5 text-secondary-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAnswers.length > 0 ? (
                  <div className="space-y-3">
                    {recentAnswers.map((answer, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                          answer.isValid
                            ? "bg-success-50 border border-success-100"
                            : "bg-error-50 border border-error-100"
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              answer.isValid
                                ? "bg-success-500 text-white"
                                : "bg-error-500 text-white"
                            }`}
                          >
                            {answer.isValid ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <XCircle className="w-5 h-5" />
                            )}
                          </div>
                          <span className="text-sm text-neutral-700 truncate max-w-[150px] font-medium">
                            {answer.answer}
                          </span>
                        </div>
                        <Badge variant={answer.isValid ? "success" : "error"}>
                          {answer.isValid ? "+10" : "+0"}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileQuestion className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">
                      No activity yet. Start learning!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem} className="mt-8">
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={action.label} to={action.to}>
                    <motion.div
                      className={`p-5 ${action.bgColor} rounded-xl text-center transition-all duration-200 group`}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div
                        className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}
                      >
                        <action.icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700 group-hover:text-neutral-900 transition-colors">
                        {action.label}
                      </p>
                      <ArrowRight className="w-4 h-4 mx-auto mt-2 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Dashboard;
