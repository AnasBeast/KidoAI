import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Gamepad2,
  Trophy,
  LayoutDashboard,
  User,
  Github,
  Twitter,
  Heart,
  BookOpen,
  Pencil,
  Mic,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quickLinks: [
      { name: "Challenges", to: "/challenges", icon: Gamepad2 },
      { name: "Leaderboard", to: "/leaderboard", icon: Trophy },
      { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { name: "Profile", to: "/profile", icon: User },
    ],
    games: [
      { name: "Quiz Game", to: "/quizz", icon: BookOpen },
      { name: "Fill in the Gaps", to: "/words", icon: Pencil },
      { name: "Speech Practice", to: "/qna", icon: Mic },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-white to-neutral-50 border-t border-neutral-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">
                KIDOAI Tutor
              </span>
            </motion.div>
            <p className="text-neutral-600 text-sm max-w-md leading-relaxed">
              Making learning fun and engaging for children with AI-powered
              educational games and challenges. Learn, play, and grow with
              KIDOAI!
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-6">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-neutral-100 hover:bg-primary-100 rounded-xl flex items-center justify-center text-neutral-500 hover:text-primary-600 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-neutral-100 hover:bg-secondary-100 rounded-xl flex items-center justify-center text-neutral-500 hover:text-secondary-600 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-800 mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 text-sm transition-colors duration-200"
                  >
                    <link.icon className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Games */}
          <div>
            <h4 className="font-semibold text-neutral-800 mb-4 text-sm uppercase tracking-wider">
              Games
            </h4>
            <ul className="space-y-3">
              {footerLinks.games.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-neutral-600 hover:text-primary-600 text-sm transition-colors duration-200"
                  >
                    <link.icon className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © {currentYear} KIDOAI Tutor. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-neutral-400 text-sm">
              <span>Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-error-500 fill-error-500" />
              </motion.div>
              <span>for education</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
