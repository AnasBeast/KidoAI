import React from "react";
import { motion } from "framer-motion";
import Header from "../components/header";
import Footer from "../components/footer";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Sparkles,
  BookOpen,
  Gamepad2,
  Trophy,
  ArrowRight,
  Rocket,
  Star,
  Zap,
} from "lucide-react";
import { staggerContainer, staggerItem } from "../config/animations";

function HomePage() {
  const features = [
    {
      icon: BookOpen,
      title: "AI-Powered Learning",
      description: "Lessons adapt to your child's progress in real-time.",
      color: "from-primary-500 to-primary-600",
    },
    {
      icon: Gamepad2,
      title: "Fun Quizzes & Games",
      description: "Interactive activities to keep learning exciting.",
      color: "from-secondary-500 to-secondary-600",
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "Kids stay motivated with scores and achievements.",
      color: "from-warning-500 to-warning-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header />

      {/* Hero Section */}
      <motion.section
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
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

        {/* Floating icons */}
        <motion.div
          className="absolute top-32 left-20 hidden md:block"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-8 h-8 text-warning-400" />
        </motion.div>
        <motion.div
          className="absolute top-48 right-32 hidden md:block"
          animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap className="w-10 h-10 text-secondary-400" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-1/4 hidden md:block"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="w-12 h-12 text-primary-400" />
        </motion.div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div variants={staggerItem} className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning Platform
            </div>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            <span className="text-neutral-800">Welcome to</span>
            <br />
            <span className="text-gradient">KIDOAI Tutor!</span>
            <motion.span
              className="inline-block ml-2"
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              🚀
            </motion.span>
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto"
          >
            Learn, Play, and Have Fun with AI-powered lessons designed for
            curious minds!
          </motion.p>

          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/challenges">
              <Button
                size="xl"
                className="gap-2 shadow-xl shadow-primary-500/30"
              >
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="xl" className="gap-2">
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-20 px-4 bg-white/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with engaging content to
              make learning an adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card
                  hover
                  className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <Card variant="gradient" className="overflow-hidden border-0">
            <CardContent className="p-10 md:p-16 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5" />
              <div className="relative z-10">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-6"
                >
                  🎓
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
                  Join thousands of young learners who are discovering the joy
                  of learning with KIDOAI Tutor.
                </p>
                <Link to="/signup">
                  <Button size="xl" className="gap-2">
                    Get Started Free
                    <Sparkles className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}

export default HomePage;
