const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables first
dotenv.config();

const connectDB = require("./database/db.js");
const userRoutes = require("./routes/userRoutes.js");
const {
  securityHeaders,
  corsOptions,
  sanitizeRequest,
} = require("./middleware/security.js");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler.js");
const { apiLimiter } = require("./middleware/rateLimiter.js");

const app = express();
const port = process.env.PORT || 3030;

// Connect to database
connectDB();

// ==================== MIDDLEWARE ====================

// Security headers
app.use(securityHeaders);

// CORS configuration
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

// Sanitize request data (prevent NoSQL injection)
app.use(sanitizeRequest);

// Rate limiting
app.use(apiLimiter);

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROUTES ====================

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "KIDOAI Tutor API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
app.use("/user", userRoutes);

// ==================== ERROR HANDLING ====================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==================== SERVER ====================

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║     KIDOAI Tutor Server                       ║
║     Running on: http://localhost:${port}         ║
║     Environment: ${process.env.NODE_ENV || "development"}                  ║
╚═══════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  // In production, you might want to gracefully shutdown
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

module.exports = app;
