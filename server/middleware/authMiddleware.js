const jwt = require("jsonwebtoken");
const User = require("../database/userModel.js");
const { ErrorTypes, asyncHandler } = require("./errorHandler.js");

/**
 * Protect routes - Verify JWT token and attach user to request
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check if token exists
  if (!token) {
    throw ErrorTypes.Unauthorized("Access denied. No token provided.");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token (exclude password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw ErrorTypes.Unauthorized("User no longer exists.");
    }

    if (!user.isActive) {
      throw ErrorTypes.Unauthorized("User account is deactivated.");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw ErrorTypes.Unauthorized("Invalid token.");
    }
    if (error.name === "TokenExpiredError") {
      throw ErrorTypes.Unauthorized("Token expired. Please login again.");
    }
    throw error;
  }
});

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

/**
 * Optional auth - Attach user if token exists, but don't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Token invalid but don't throw error for optional auth
      req.user = null;
    }
  }

  next();
});

module.exports = { protect, generateToken, optionalAuth };
