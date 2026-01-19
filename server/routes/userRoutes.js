const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  signupValidation,
  loginValidation,
  updateProfileValidation,
  answerValidation,
} = require("../middleware/validation");
const {
  authLimiter,
  signupLimiter,
  aiLimiter,
} = require("../middleware/rateLimiter");
const {
  getUser,
  regUser,
  loginUser,
  addAnswer,
  getAnswers,
  updateProfile,
  getAllUsers,
  verifyPasssword,
  testApi,
  verifyOauth,
  listenApi,
  getLeaderboard,
  getUserStats,
} = require("../controllers/userControllers");

// ==================== PUBLIC ROUTES ====================

// Auth routes with rate limiting
router.post("/signup", signupLimiter, signupValidation, regUser);
router.put("/login", authLimiter, loginValidation, loginUser);
router.post("/auth/google", authLimiter, verifyOauth);

// Public data routes
router.get("/dashboard", getAllUsers);
router.get("/leaderboard", getLeaderboard);

// AI-powered routes (rate limited)
router.get("/getAiQuizz", aiLimiter, testApi);
router.get("/sound", aiLimiter, listenApi);

// ==================== PROTECTED ROUTES ====================

// Profile routes
router.get("/profile", protect, getUser);
router.put("/editProfile", protect, updateProfileValidation, updateProfile);
router.put("/verifyPassword", protect, verifyPasssword);
router.get("/stats", protect, getUserStats);

// Answer routes
router.post("/submit", protect, answerValidation, addAnswer);
router.get("/answers", protect, getAnswers);
router.get("/answers/:id", protect, getAnswers); // Legacy support

module.exports = router;
