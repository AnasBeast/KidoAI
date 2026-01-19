import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useToast } from "./Toast";
import {
  Home,
  LayoutDashboard,
  Trophy,
  Gamepad2,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

const Header = ({ title }) => {
  const { verifyUser, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  document.title = title || "KIDOAI Tutor";

  useEffect(() => {
    verifyUser();
  }, [verifyUser]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon }) => (
    <Link to={to}>
      <motion.div
        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
          isActive(to)
            ? "text-primary-600 bg-primary-50 font-semibold"
            : "text-neutral-600 hover:text-primary-600 hover:bg-primary-50/50"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
        {isActive(to) && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-neutral-200/50"
            : "bg-white/60 backdrop-blur-md"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-success-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <span className="text-xl font-bold text-gradient">
                  KIDOAI Tutor
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <NavLink to="/" icon={Home}>
                    Home
                  </NavLink>
                  <NavLink to="/dashboard" icon={LayoutDashboard}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/challenges" icon={Gamepad2}>
                    Challenges
                  </NavLink>
                  <NavLink to="/leaderboard" icon={Trophy}>
                    Leaderboard
                  </NavLink>
                  <NavLink to="/profile" icon={User}>
                    Profile
                  </NavLink>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="ml-2 flex items-center gap-2 px-4 py-2 text-error-600 hover:bg-error-50 rounded-xl transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <NavLink to="/login" icon={LogIn}>
                    Login
                  </NavLink>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="ml-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all duration-200 font-medium"
                    >
                      <UserPlus className="w-4 h-4" />
                      Sign Up
                    </motion.button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-neutral-100 transition"
              aria-label="Toggle menu"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-600" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-600" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <MobileNavLink to="/" icon={Home} active={isActive("/")}>
                      Home
                    </MobileNavLink>
                    <MobileNavLink
                      to="/dashboard"
                      icon={LayoutDashboard}
                      active={isActive("/dashboard")}
                    >
                      Dashboard
                    </MobileNavLink>
                    <MobileNavLink
                      to="/challenges"
                      icon={Gamepad2}
                      active={isActive("/challenges")}
                    >
                      Challenges
                    </MobileNavLink>
                    <MobileNavLink
                      to="/leaderboard"
                      icon={Trophy}
                      active={isActive("/leaderboard")}
                    >
                      Leaderboard
                    </MobileNavLink>
                    <MobileNavLink
                      to="/profile"
                      icon={User}
                      active={isActive("/profile")}
                    >
                      Profile
                    </MobileNavLink>
                    <motion.button
                      onClick={handleLogout}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 px-4 py-3 text-error-600 hover:bg-error-50 rounded-xl transition text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <MobileNavLink
                      to="/login"
                      icon={LogIn}
                      active={isActive("/login")}
                    >
                      Login
                    </MobileNavLink>
                    <MobileNavLink
                      to="/signup"
                      icon={UserPlus}
                      active={isActive("/signup")}
                    >
                      Sign Up
                    </MobileNavLink>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
};

const MobileNavLink = ({ to, active, children, icon: Icon }) => (
  <Link to={to}>
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
        active
          ? "bg-primary-50 text-primary-600 font-medium"
          : "text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.div>
  </Link>
);

export default Header;
