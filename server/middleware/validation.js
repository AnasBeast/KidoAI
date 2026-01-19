const { body, param, query, validationResult } = require("express-validator");

/**
 * Validate email field
 */
const validateEmail = () =>
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail();

/**
 * Validate password field with strong password requirements
 */
const validatePassword = () =>
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    );

/**
 * Validate password field (optional, for profile updates)
 */
const validatePasswordOptional = () =>
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    );

/**
 * Validate name field
 */
const validateName = () =>
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    );

/**
 * Validate name field (optional, for profile updates)
 */
const validateNameOptional = () =>
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    );

/**
 * Validate difficulty field
 */
const validateDifficulty = () =>
  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard");

/**
 * Validate answer submission
 */
const validateAnswer = () => [
  body("answer").trim().notEmpty().withMessage("Answer is required"),
  body("isValid").isBoolean().withMessage("isValid must be a boolean"),
];

/**
 * Validate MongoDB ObjectId parameter
 */
const validateObjectId = (paramName = "id") =>
  param(paramName).isMongoId().withMessage(`Invalid ${paramName} format`);

/**
 * Validate pagination query parameters
 */
const validatePagination = () => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        msg: err.msg,
        value: err.value,
      })),
    });
  }

  next();
};

/**
 * Validation middleware chains for common operations
 */
const signupValidation = [
  validateName(),
  validateEmail(),
  validatePassword(),
  handleValidationErrors,
];

const loginValidation = [
  validateEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

const updateProfileValidation = [
  validateNameOptional(),
  validatePasswordOptional(),
  validateDifficulty(),
  handleValidationErrors,
];

const answerValidation = [...validateAnswer(), handleValidationErrors];

module.exports = {
  validateEmail,
  validatePassword,
  validatePasswordOptional,
  validateName,
  validateNameOptional,
  validateDifficulty,
  validateAnswer,
  validateObjectId,
  validatePagination,
  handleValidationErrors,
  // Pre-built validation chains
  signupValidation,
  loginValidation,
  updateProfileValidation,
  answerValidation,
};
