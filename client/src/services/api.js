import axios from "axios";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3030";

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Handle specific error codes
    if (response) {
      switch (response.status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem("token");
          // Redirect to login if not already there
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 429:
          console.error("Too many requests - please try again later");
          break;
        case 500:
          console.error("Server error - please try again later");
          break;
        default:
          break;
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    } else if (!navigator.onLine) {
      console.error("No internet connection");
    }

    return Promise.reject(error);
  },
);

// ==================== USER API ====================
export const userAPI = {
  // Authentication
  signup: (data) => api.post("/user/signup", data),
  login: (data) => api.put("/user/login", data),
  verifyOAuth: (data) => api.post("/user/auth/google", data),

  // Profile
  getProfile: () => api.get("/user/profile"),
  updateProfile: (data) => api.put("/user/editProfile", data),
  verifyPassword: (data) => api.put("/user/verifyPassword", data),

  // Answers & Progress
  submitAnswer: (data) => api.post("/user/submit", data),
  getAnswers: () => api.get("/user/answers"),

  // Dashboard & Leaderboard
  getAllUsers: () => api.get("/user/dashboard"),
  getLeaderboard: (params) => api.get("/user/leaderboard", { params }),

  // Stats
  getStats: () => api.get("/user/stats"),
};

// ==================== QUIZ API ====================
export const quizAPI = {
  getRandomQuestion: () => api.get("/user/getAiQuizz"),
  getSpeechChallenge: () => api.get("/user/sound"),
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.details) {
    // Handle validation errors
    return error.response.data.details.map((d) => d.msg).join(", ");
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

/**
 * Check if the error is a network error
 */
export const isNetworkError = (error) => {
  return !error.response && error.code !== "ECONNABORTED";
};

/**
 * Check if the error is a validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 400 && error.response?.data?.details;
};

export default api;
