const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * Allows 100 requests per minute per IP
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per window
  message: {
    error: true,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: "Too many requests, please try again later.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: true,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    res.status(429).json({
      error: true,
      message: "Too many login attempts, please try again after 15 minutes.",
    });
  },
});

/**
 * Rate limiter for signup endpoint
 * Prevents account creation spam
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 accounts per hour per IP
  message: {
    error: true,
    message:
      "Too many accounts created from this IP, please try again after an hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for AI-powered endpoints
 * These are expensive operations
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: true,
    message: "Too many AI requests, please wait a moment before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Lenient rate limiter for public endpoints
 */
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: {
    error: true,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  signupLimiter,
  aiLimiter,
  publicLimiter,
};
