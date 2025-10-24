const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  username: { type: String },
  password: { type: String },
  role: { type: String, required: true },
  customerId: { type: String },
  googleId: { type: String },
  email: { type: String },
  name: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  avatar: { type: String },
  googleProfile: { type: Object },
  googleTokens: { type: Object },
  loginHistory: [{ type: Object }],
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isTwoFactorEnabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
