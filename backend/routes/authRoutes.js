const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { generateToken, authenticateToken } = require('../utils/jwt');
const User = require('../models/User');

const router = express.Router();

// Khởi động OAuth flow với Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Xử lý callback từ Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Tạo JWT token
      const token = generateToken(req.user);

      // Redirect về frontend CHỈ với token
      // Frontend sẽ gọi /api/auth/me để lấy thông tin user
      // KHÔNG gửi user data qua URL để tránh lộ thông tin trong browser history/logs
      const frontendUrl = process.env.FRONTEND_URL || 'http://127.0.0.1:5500/frontend/components/home/home.html';
      res.redirect(`${frontendUrl}?token=${token}`);
    } catch (err) {
      console.error('Error in Google callback:', err);
      res.status(500).json({ message: 'Lỗi xác thực', error: err.message });
    }
  }
);

// Lấy thông tin user từ JWT token
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User không tìm thấy' });
    }
    
    // Trả về thông tin user (MINIMAL - không bao gồm sensitive data)
    // Sử dụng default values cho trường hợp users cũ chưa migrate
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'Customer',
      customerId: user.customerId,
      authProvider: user.authProvider || 'google',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi logout' });
    }
    res.json({ message: 'Logout thành công' });
  });
});

// Lấy lịch sử đăng nhập của user (Removed - không còn track loginHistory trong User model)
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    // loginHistory đã bị loại bỏ khỏi User model để tối ưu
    // Trả về empty history
    res.json({
      message: 'Login history tracking disabled for optimization',
      loginHistory: [],
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;