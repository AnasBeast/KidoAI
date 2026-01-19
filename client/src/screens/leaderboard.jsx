import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { userAPI, getErrorMessage } from "../services/api";

const Leaderboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const { data } = await userAPI.getAllUsers();

        if (data?.users) {
          // Sort by score and add ranks
          const sorted = data.users
            .sort((a, b) => b.score - a.score)
            .map((u, index) => ({
              ...u,
              rank: index + 1,
            }));

          setLeaderboard(sorted);

          // Find current user's rank
          if (user) {
            const currentUserRank = sorted.findIndex(
              (u) => u.name === user.name,
            );
            if (currentUserRank !== -1) {
              setUserRank(currentUserRank + 1);
            }
          }
        }
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, toast]);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-orange-700 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRankEmoji = (rank) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return rank;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100">
        <Header title="Leaderboard" />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Loading leaderboard..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100">
      <Header title="Leaderboard" />

      <motion.div
        className="pt-24 pb-20 px-4 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-3">
            🏆 Leaderboard
          </h1>
          <p className="text-gray-600 mt-2">Top learners of KIDOAI Tutor</p>
        </motion.div>

        {/* User's Current Rank Card */}
        {userRank && (
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-sm">Your Current Rank</p>
                <p className="text-4xl font-bold">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-sm">Your Score</p>
                <p className="text-4xl font-bold">{user?.score || 0}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <motion.div
            className="flex justify-center items-end gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* 2nd Place */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-2 flex items-center justify-center text-3xl">
                🥈
              </div>
              <div className="bg-gray-200 rounded-t-lg p-4 h-24 flex flex-col justify-end">
                <p className="font-bold text-gray-800 truncate max-w-[80px]">
                  {leaderboard[1]?.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {leaderboard[1]?.score} pts
                </p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-24 h-24 rounded-full bg-yellow-100 mx-auto mb-2 flex items-center justify-center text-4xl shadow-lg">
                🥇
              </div>
              <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-lg p-4 h-32 flex flex-col justify-end">
                <p className="font-bold text-white truncate max-w-[100px]">
                  {leaderboard[0]?.name}
                </p>
                <p className="text-yellow-100 text-sm">
                  {leaderboard[0]?.score} pts
                </p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto mb-2 flex items-center justify-center text-3xl">
                🥉
              </div>
              <div className="bg-amber-600 rounded-t-lg p-4 h-20 flex flex-col justify-end">
                <p className="font-bold text-white truncate max-w-[80px]">
                  {leaderboard[2]?.name}
                </p>
                <p className="text-amber-100 text-sm">
                  {leaderboard[2]?.score} pts
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Full Leaderboard List */}
        <motion.div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
            <span className="font-semibold text-gray-700">Rank</span>
            <span className="font-semibold text-gray-700 flex-1 text-center">
              Player
            </span>
            <span className="font-semibold text-gray-700">Score</span>
          </div>

          <div className="divide-y">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No players yet. Be the first! 🎮
              </div>
            ) : (
              leaderboard.map((player, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${
                    player.name === user?.name ? "bg-indigo-50" : ""
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(player.rank)}`}
                  >
                    {getRankEmoji(player.rank)}
                  </div>

                  <div className="flex-1 text-center">
                    <span
                      className={`font-medium ${player.name === user?.name ? "text-indigo-600" : "text-gray-800"}`}
                    >
                      {player.name}
                      {player.name === user?.name && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-gray-800">
                      {player.score}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">pts</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
