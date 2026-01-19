import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { GAME_CARDS } from "../config/constants";
import {
  Brain,
  Pencil,
  Mic,
  ArrowRight,
  Trophy,
  Sparkles,
  Star,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

const iconMap = {
  "🧠": Brain,
  "✍️": Pencil,
  "🎤": Mic,
};

const Challenges = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Header Section */}
          <motion.div
            className="text-center mb-12 relative"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Floating decorations */}
            <motion.div
              className="absolute top-0 left-10 hidden md:block"
              animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Star className="w-8 h-8 text-warning-400" />
            </motion.div>
            <motion.div
              className="absolute top-10 right-20 hidden md:block"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-10 h-10 text-secondary-400" />
            </motion.div>

            <motion.div variants={staggerItem}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                Choose Your Adventure
              </div>
            </motion.div>

            <motion.h1
              variants={staggerItem}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="text-neutral-800">Pick Your </span>
              <span className="text-gradient">Challenge</span>
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="text-neutral-600 text-lg max-w-2xl mx-auto"
            >
              Pick a game mode and start learning! Each challenge helps you grow
              your knowledge in a fun way.
            </motion.p>
          </motion.div>

          {/* Game Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {GAME_CARDS.map((card, index) => {
              const IconComponent = iconMap[card.icon] || Brain;

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <Link to={card.link}>
                    <Card
                      hover
                      className={`h-full border-0 overflow-hidden cursor-pointer group ${card.gradient}`}
                    >
                      <CardContent className="p-0">
                        <div
                          className={`p-8 h-full flex flex-col bg-gradient-to-br ${card.gradient} text-white`}
                        >
                          {/* Icon */}
                          <motion.div
                            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20,
                              delay: 0.2 + index * 0.1,
                            }}
                          >
                            <IconComponent className="w-8 h-8" />
                          </motion.div>

                          {/* Title */}
                          <h2 className="text-2xl font-bold mb-3">
                            {card.title}
                          </h2>

                          {/* Description */}
                          <p className="text-white/90 mb-6 flex-grow">
                            {card.description}
                          </p>

                          {/* Play Button */}
                          <motion.div
                            className="bg-white/20 backdrop-blur-sm py-3 px-6 rounded-xl text-center font-semibold flex items-center justify-center gap-2 group-hover:bg-white/30 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span>Play Now</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Stats Section */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card variant="glass" className="max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 text-neutral-600 mb-4">
                  <Trophy className="w-5 h-5 text-warning-500" />
                  <span className="font-medium">
                    Complete challenges to earn points!
                  </span>
                </div>
                <Link to="/leaderboard">
                  <Button variant="outline" className="gap-2">
                    View Leaderboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Challenges;
