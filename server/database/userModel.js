const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  isValid: {
    type: Boolean,
    required: true,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // only require password if NOT Google user
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password in queries by default
    },
    googleId: {
      type: String,
      default: null,
      unique: true,
      sparse: true, // Allow multiple null values
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be easy, medium, or hard",
      },
      default: "easy",
    },
    score: {
      type: Number,
      default: 0,
      min: [0, "Score cannot be negative"],
    },
    answers: [answerSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ score: -1 }); // For leaderboard queries
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash password if it was modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate user stats
userSchema.methods.getStats = function () {
  const totalAnswers = this.answers.length;
  const correctAnswers = this.answers.filter((a) => a.isValid).length;
  const accuracy =
    totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(2) : 0;

  // Calculate streak
  let streak = 0;
  for (let i = this.answers.length - 1; i >= 0; i--) {
    if (this.answers[i].isValid) streak++;
    else break;
  }

  return {
    totalAnswers,
    correctAnswers,
    incorrectAnswers: totalAnswers - correctAnswers,
    accuracy: parseFloat(accuracy),
    streak,
  };
};

// Static method for leaderboard
userSchema.statics.getLeaderboard = async function (limit = 10) {
  return this.find({ isActive: true })
    .select("name score difficulty answers createdAt")
    .sort({ score: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model("Users", userSchema);
