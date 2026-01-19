const helmet = require("helmet");

/**
 * Security headers configuration using Helmet
 */
const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://models.inference.ai.azure.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // Prevent clickjacking
  frameguard: {
    action: "deny",
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // Prevent MIME type sniffing
  noSniff: true,

  // XSS Filter
  xssFilter: true,

  // Referrer Policy
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin",
  },
});

/**
 * CORS configuration for production
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001",
    ];

    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
  maxAge: 86400, // 24 hours
};

/**
 * Sanitize request data to prevent NoSQL injection
 */
const sanitizeData = (obj) => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    // Remove keys starting with $ or containing .
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    if (typeof obj[key] === "object") {
      sanitized[key] = sanitizeData(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body, params, and query
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeData(req.body);
  }
  if (req.params) {
    req.params = sanitizeData(req.params);
  }
  if (req.query) {
    req.query = sanitizeData(req.query);
  }
  next();
};

/**
 * Simple XSS protection for string values
 */
const escapeHtml = (str) => {
  if (typeof str !== "string") return str;

  const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
};

/**
 * Middleware to escape HTML in string values
 */
const xssProtection = (req, res, next) => {
  const escapeObject = (obj) => {
    if (obj === null || typeof obj !== "object") {
      return typeof obj === "string" ? escapeHtml(obj) : obj;
    }

    const escaped = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      escaped[key] = escapeObject(obj[key]);
    }

    return escaped;
  };

  if (req.body) {
    req.body = escapeObject(req.body);
  }

  next();
};

module.exports = {
  securityHeaders,
  corsOptions,
  sanitizeRequest,
  xssProtection,
};
