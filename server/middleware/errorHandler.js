/**
 * Custom API Error class with status code support
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types with predefined status codes
 */
const ErrorTypes = {
  BadRequest: (message = "Bad request", details = null) =>
    new APIError(message, 400, details),

  Unauthorized: (message = "Unauthorized access") => new APIError(message, 401),

  Forbidden: (message = "Access forbidden") => new APIError(message, 403),

  NotFound: (message = "Resource not found") => new APIError(message, 404),

  Conflict: (message = "Resource already exists") => new APIError(message, 409),

  TooManyRequests: (message = "Too many requests, please try again later") =>
    new APIError(message, 429),

  Internal: (message = "Internal server error") => new APIError(message, 500),
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Log error for debugging (in production, use a proper logger)
  console.error(`[${new Date().toISOString()}] Error:`, {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    // Mongoose validation error
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      msg: e.message,
    }));
  } else if (err.name === "CastError") {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Send error response
  const response = {
    error: true,
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      originalError: err.message,
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async functions
 * Eliminates the need for try-catch in every controller
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Not found handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = ErrorTypes.NotFound(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  APIError,
  ErrorTypes,
  errorHandler,
  asyncHandler,
  notFoundHandler,
};
