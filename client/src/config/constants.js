// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3030",
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  TIMEOUT: 15000,
};

// Application Routes
export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  EDIT_PROFILE: "/edit-profile",
  DASHBOARD: "/dashboard",
  LEADERBOARD: "/leaderboard",
  QUIZZ: "/quizz",
  QNA: "/qna",
  FILL_GAPS: "/words",
  CHALLENGES: "/challenges",
};

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const DIFFICULTY_OPTIONS = [
  { value: DIFFICULTY_LEVELS.EASY, label: "Easy", color: "green" },
  { value: DIFFICULTY_LEVELS.MEDIUM, label: "Medium", color: "yellow" },
  { value: DIFFICULTY_LEVELS.HARD, label: "Hard", color: "red" },
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Unable to connect. Please check your internet connection.",
  UNAUTHORIZED: "Your session has expired. Please login again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Something went wrong. Please try again later.",
  LOGIN_FAILED: "Invalid email or password.",
  SIGNUP_FAILED: "Unable to create account. Please try again.",
  PROFILE_UPDATE_FAILED: "Unable to update profile. Please try again.",
  ANSWER_SUBMIT_FAILED: "Unable to submit answer. Please try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Welcome back!",
  SIGNUP_SUCCESS: "Account created successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  ANSWER_CORRECT: "Correct! Well done! 🎉",
  ANSWER_INCORRECT: "Not quite right. Keep trying! 💪",
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  POINTS_PER_CORRECT: 10,
  TIME_LIMIT_SECONDS: 30,
  MAX_QUESTIONS_PER_SESSION: 10,
};

// Animation Variants for Framer Motion
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
  QUIZ_CACHE: "quiz_cache",
};

// Validation Rules
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

// Badge Definitions
export const BADGES = [
  {
    id: "first_answer",
    name: "First Step",
    description: "Answer your first question",
    icon: "🎯",
    requirement: 1,
  },
  {
    id: "perfect_streak",
    name: "Perfect!",
    description: "Get 10 correct answers in a row",
    icon: "⭐",
    requirement: 10,
  },
  {
    id: "dedicated",
    name: "Dedicated Learner",
    description: "Answer 50 questions",
    icon: "📚",
    requirement: 50,
  },
  {
    id: "century",
    name: "Century",
    description: "Reach 100 points",
    icon: "💯",
    requirement: 100,
  },
  {
    id: "master",
    name: "Quiz Master",
    description: "Reach 1000 points",
    icon: "🏆",
    requirement: 1000,
  },
];

// Game Cards for Challenges
export const GAME_CARDS = [
  {
    id: 1,
    title: "Quiz Game",
    description: "Test your knowledge with AI-generated questions!",
    link: APP_ROUTES.QUIZZ,
    color: "bg-primary-500",
    gradient: "from-primary-500 to-primary-600",
    icon: "🧠",
  },
  {
    id: 2,
    title: "Fill in the Gaps",
    description: "Complete sentences and learn vocabulary!",
    link: APP_ROUTES.FILL_GAPS,
    color: "bg-secondary-500",
    gradient: "from-secondary-500 to-secondary-600",
    icon: "✍️",
  },
  {
    id: 3,
    title: "Speech Challenge",
    description: "Practice pronunciation with voice recognition!",
    link: APP_ROUTES.QNA,
    color: "bg-success-500",
    gradient: "from-success-500 to-success-600",
    icon: "🎤",
  },
];
