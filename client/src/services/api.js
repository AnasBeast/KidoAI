import axios from "axios";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3030";

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Reduced to 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Track pending requests to prevent duplicates
const pendingRequests = new Map();

// Generate a unique key for each request
const getRequestKey = (config) => {
  return `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
};

// Request interceptor - Add token and prevent duplicate requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For GET requests, check if there's already a pending request
    if (config.method === "get") {
      const requestKey = getRequestKey(config);

      if (pendingRequests.has(requestKey)) {
        // Cancel the new request and return the pending one
        const controller = new AbortController();
        config.signal = controller.signal;
        controller.abort("Duplicate request cancelled");
      } else {
        // Track this request
        const controller = new AbortController();
        config.signal = controller.signal;
        pendingRequests.set(requestKey, controller);

        // Store the key for cleanup
        config._requestKey = requestKey;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle common errors globally
api.interceptors.response.use(
  (response) => {
    // Clean up pending request tracking
    if (response.config._requestKey) {
      pendingRequests.delete(response.config._requestKey);
    }
    return response;
  },
  (error) => {
    // Clean up pending request tracking
    if (error.config?._requestKey) {
      pendingRequests.delete(error.config._requestKey);
    }

    // Don't process cancelled requests
    if (
      axios.isCancel(error) ||
      error.message === "Duplicate request cancelled"
    ) {
      return Promise.reject(error);
    }

    const { response } = error;

    // Handle specific error codes
    if (response) {
      switch (response.status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem("token");
          // Only redirect if not already on login/signup/home page
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/signup" &&
            window.location.pathname !== "/"
          ) {
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
      console.error("Request timeout - server may be slow or unavailable");
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
  getRandomQuestion: () => api.get("/user/getAiQuizz", { timeout: 30000 }), // AI needs longer timeout
  getSpeechChallenge: () => api.get("/user/sound", { timeout: 30000 }),
  submitAnswer: (data) => api.post("/user/submit", data),
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error) => {
  // Handle cancelled requests
  if (axios.isCancel(error)) {
    return "Request was cancelled";
  }

  // Handle timeout
  if (error.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection and try again.";
  }

  // Handle network errors
  if (!error.response && !navigator.onLine) {
    return "No internet connection. Please check your network.";
  }

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
  return (
    !error.response && error.code !== "ECONNABORTED" && !axios.isCancel(error)
  );
};

/**
 * Check if the error is a validation error
 */
export const isValidationError = (error) => {
  return error.response?.status === 400 && error.response?.data?.details;
};

/**
 * Check if error is a timeout error
 */
export const isTimeoutError = (error) => {
  return error.code === "ECONNABORTED";
};

/**
 * Cancel all pending requests (useful for cleanup)
 */
export const cancelAllRequests = () => {
  pendingRequests.forEach((controller) => {
    controller.abort("Request cancelled");
  });
  pendingRequests.clear();
};

export default api;
