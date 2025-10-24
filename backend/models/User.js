const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  avatar: {
    type: String,
    default: null,
  },
  // Google Profile Info
  googleProfile: {
    displayName: String,
    photo: String,
    locale: String,
    raw: Object,
  },
  // Google Tokens
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
  },
  // Login Statistics
  loginHistory: [
    {
      loginAt: {
        type: Date,
        default: Date.now,
      },
      loginMethod: {
        type: String,
        enum: ['google', 'email', 'phone'],
      },
      ipAddress: String,
      userAgent: String,
    },
  ],
  lastLogin: {
    type: Date,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTwoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes để tìm kiếm nhanh
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ lastLogin: -1 });

module.exports = mongoose.model('User', userSchema);
