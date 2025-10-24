const mongoose = require('mongoose');

// ===== UNIFIED USER SCHEMA (Merged Version) =====
const userSchema = new mongoose.Schema({
  // === Authentication (Username OR Google) ===
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true,
  },
  password: {
    type: String,
    // Chỉ required nếu là username login
    required: function() {
      return this.authProvider === 'username';
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  
  // === Core User Info ===
  email: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true,
    // Email required cho Google users, optional cho username users
    required: function() {
      return this.authProvider === 'google';
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  
  // === Authorization ===
  role: {
    type: String,
    enum: ['Admin', 'Staff', 'Customer'],
    default: 'Customer',
  },
  customerId: {
    type: String,
    default: null,
  },
  
  // === Auth Provider ===
  authProvider: {
    type: String,
    enum: ['username', 'google'],
    required: true,
    default: 'username',
  },
  
  // === Google Profile Info (Extended) ===
  googleProfile: {
    displayName: String,
    photo: String,
    locale: String,
    raw: Object,
  },
  
  // === Google Tokens ===
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
  },
  
  // === Login Statistics ===
  loginHistory: [
    {
      loginAt: {
        type: Date,
        default: Date.now,
      },
      loginMethod: {
        type: String,
        enum: ['google', 'email', 'phone', 'username'],
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
  
  // === Timestamps ===
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Mongoose options
  timestamps: true, // Tự động update createdAt và updatedAt
  collection: 'users',
});

// ===== INDEXES =====
userSchema.index({ username: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ===== METHODS =====

// Update timestamp khi save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('User', userSchema);