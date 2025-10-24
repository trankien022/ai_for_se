const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // === CÁC TRƯỜNG MỚI TỪ GITHUB (Version 2) ===
  // Lưu ý: Trường _id này sẽ ghi đè _id (ObjectId) mặc định của Mongoose
  // Nếu bạn không chắc, hãy hỏi lại đồng đội của mình về trường này.
  _id: { type: String, required: true },
  username: { type: String }, // Trường mới
  password: { type: String }, // Trường mới
  role: { type: String, required: true }, // Trường mới
  customerId: { type: String }, // Trường mới

  // === CÁC TRƯỜNG CHI TIẾT TỪ PHIÊN BẢN CỦA BẠN (Version 1) ===
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
  // Google Profile Info (Chi tiết từ Version 1)
  googleProfile: {
    displayName: String,
    photo: String,
    locale: String,
    raw: Object,
  },
  // Google Tokens (Chi tiết từ Version 1)
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
  },
  // Login Statistics (Chi tiết từ Version 1)
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

// Indexes để tìm kiếm nhanh (từ Version 1)
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ lastLogin: -1 });

module.exports = mongoose.model('User', userSchema);