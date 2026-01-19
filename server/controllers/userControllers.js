const User = require("../database/userModel.js");
const bcrypt = require("bcryptjs");
const OpenAI = require("openai");
const { OAuth2Client } = require("google-auth-library");
const { generateToken } = require("../middleware/authMiddleware.js");
const { asyncHandler, ErrorTypes } = require("../middleware/errorHandler.js");

// ==================== AUTH CONTROLLERS ====================

/**
 * @desc    Register a new user
 * @route   POST /user/signup
 * @access  Public
 */
const regUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw ErrorTypes.Conflict("An account with this email already exists");
  }

  // Create new user (password will be hashed by pre-save hook)
  const newUser = new User({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
  });

  await newUser.save();

  // Generate token and respond
  const token = generateToken(newUser);

  res.status(201).json({
    error: false,
    message: "Account created successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      difficulty: newUser.difficulty,
      score: newUser.score,
      token,
    },
  });
});

/**
 * @desc    Login user
 * @route   PUT /user/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw ErrorTypes.Unauthorized("Invalid email or password");
  }

  // Check if user signed up with Google
  if (user.googleId && !user.password) {
    throw ErrorTypes.BadRequest(
      "This account uses Google sign-in. Please use 'Sign in with Google'.",
    );
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ErrorTypes.Unauthorized("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user);

  res.status(200).json({
    error: false,
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      difficulty: user.difficulty,
      score: user.score,
      token,
    },
  });
});

/**
 * @desc    Verify Google OAuth token and login/register user
 * @route   POST /user/auth/google
 * @access  Public
 */
const verifyOauth = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw ErrorTypes.BadRequest("Google token is required");
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const { email, name, sub: googleId } = ticket.getPayload();

  // Check if user exists
  let user = await User.findOne({
    $or: [{ email }, { googleId }],
  });

  if (!user) {
    // Create new user
    user = await User.create({
      email,
      name,
      googleId,
      difficulty: "easy",
    });
  } else if (!user.googleId) {
    // Link Google account to existing user
    user.googleId = googleId;
    await user.save();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT
  const authToken = generateToken(user);

  res.json({
    error: false,
    message: "Authentication successful",
    token: authToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      difficulty: user.difficulty,
      score: user.score,
    },
  });
});

// ==================== USER PROFILE CONTROLLERS ====================

/**
 * @desc    Get current user profile
 * @route   GET /user/profile
 * @access  Private
 */
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  res.json({
    error: false,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      difficulty: user.difficulty,
      score: user.score,
      answers: user.answers,
      googleId: user.googleId || null,
      createdAt: user.createdAt,
      stats: user.getStats(),
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /user/editProfile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, password, difficulty } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  // Update fields if provided
  if (name) user.name = name.trim();
  if (difficulty) user.difficulty = difficulty;
  if (password) user.password = password; // Will be hashed by pre-save hook

  await user.save();

  res.status(200).json({
    error: false,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      difficulty: user.difficulty,
    },
  });
});

/**
 * @desc    Verify user password
 * @route   PUT /user/verifyPassword
 * @access  Private
 */
const verifyPasssword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw ErrorTypes.BadRequest("Password is required");
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  if (user.googleId && !user.password) {
    throw ErrorTypes.BadRequest(
      "This account uses Google sign-in and has no password",
    );
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw ErrorTypes.Unauthorized("Incorrect password");
  }

  res.status(200).json({
    error: false,
    message: "Password verified",
  });
});

// ==================== ANSWERS & PROGRESS CONTROLLERS ====================

/**
 * @desc    Add a new answer
 * @route   POST /user/submit
 * @access  Private
 */
const addAnswer = asyncHandler(async (req, res) => {
  const { isValid, answer } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  // Add answer with timestamp
  user.answers.push({
    answer: answer.trim(),
    isValid,
    timestamp: new Date(),
  });

  // Update score if correct
  if (isValid) {
    user.score += 10;
  }

  await user.save();

  res.status(200).json({
    error: false,
    message: isValid ? "Correct! +10 points" : "Not quite right. Keep trying!",
    score: user.score,
    totalAnswers: user.answers.length,
  });
});

/**
 * @desc    Get user answers
 * @route   GET /user/answers
 * @access  Private
 */
const getAnswers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  const answers = user.answers || [];
  const stats = user.getStats();

  res.status(200).json({
    error: false,
    message: answers.length > 0 ? "Answers found" : "No answers yet",
    answers,
    stats,
  });
});

/**
 * @desc    Get user statistics
 * @route   GET /user/stats
 * @access  Private
 */
const getUserStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw ErrorTypes.NotFound("User not found");
  }

  res.json({
    error: false,
    stats: {
      ...user.getStats(),
      score: user.score,
      difficulty: user.difficulty,
      memberSince: user.createdAt,
    },
  });
});

// ==================== PUBLIC DATA CONTROLLERS ====================

/**
 * @desc    Get all users (for dashboard/leaderboard)
 * @route   GET /user/dashboard
 * @access  Public
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true })
    .select("name score difficulty")
    .sort({ score: -1 })
    .limit(50);

  res.status(200).json({
    error: false,
    message: "Users retrieved",
    count: users.length,
    users: users.map((user) => ({
      name: user.name,
      score: user.score,
      difficulty: user.difficulty,
    })),
  });
});

/**
 * @desc    Get leaderboard
 * @route   GET /user/leaderboard
 * @access  Public
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;

  const users = await User.getLeaderboard(parseInt(limit));

  const leaderboard = users.map((user, index) => ({
    rank: parseInt(offset) + index + 1,
    name: user.name,
    score: user.score,
    difficulty: user.difficulty,
    accuracy: user.answers?.length
      ? (
          (user.answers.filter((a) => a.isValid).length / user.answers.length) *
          100
        ).toFixed(1)
      : 0,
  }));

  res.status(200).json({
    error: false,
    leaderboard,
  });
});

// ==================== AI CONTROLLERS ====================

/**
 * Extract JSON from markdown code block
 */
const extractJSON = (text) => {
  const match = text.match(/```json([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // Try parsing without code blocks
      try {
        return JSON.parse(text.trim());
      } catch (e2) {
        return null;
      }
    }
  }
  // Try parsing raw text
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    return null;
  }
};

/**
 * @desc    Get AI-generated quiz question
 * @route   GET /user/getAiQuizz
 * @access  Public
 */
const testApi = asyncHandler(async (req, res) => {
  const token = process.env.api_token;

  if (!token) {
    throw ErrorTypes.Internal("AI service not configured");
  }

  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: token,
  });

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a language teacher creating quizzes for students. 
        Create 1 question in Spanish with its translation hint.
        Return ONLY valid JSON in this exact format:
        [{"text": "¿Question in Spanish?", "hint": "English hint", "options": [{"id": "1", "text": "Option 1", "isCorrect": false}, {"id": "2", "text": "Option 2", "isCorrect": true}, {"id": "3", "text": "Option 3", "isCorrect": false}, {"id": "4", "text": "Option 4", "isCorrect": false}]}]
        Make sure exactly one option has isCorrect: true.`,
      },
    ],
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 500,
  });

  const chatResponse = response.choices[0].message.content;
  const chatJson = extractJSON(chatResponse);

  if (!chatJson || !chatJson[0]) {
    throw ErrorTypes.Internal("Failed to generate question");
  }

  res.status(200).json(chatJson[0]);
});

/**
 * @desc    Get AI-generated speech challenge
 * @route   GET /user/sound
 * @access  Public
 */
const listenApi = asyncHandler(async (req, res) => {
  const token = process.env.api_token;

  if (!token) {
    throw ErrorTypes.Internal("AI service not configured");
  }

  const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: token,
  });

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a language teacher. Generate a short, clear English sentence (maximum 8 words) for speech practice.
        Return ONLY the sentence, no quotes, no explanation, just the plain sentence.`,
      },
    ],
    model: "gpt-4o",
    temperature: 0.7,
    max_tokens: 50,
  });

  const sentence = response.choices[0].message.content
    .trim()
    .replace(/['"]/g, "");

  res.status(200).json({
    sentence,
    wordCount: sentence.split(" ").length,
  });
});

// ==================== EXPORTS ====================

module.exports = {
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
};
