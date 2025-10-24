const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const { generateToken, authenticateToken } = require('../utils/jwt');
const User = require('../models/User');

const router = express.Router();

// Middleware để ghi nhận IP và User Agent
const captureLoginInfo = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    
    // Lưu vào session để sử dụng trong callback
    req.session.loginInfo = {
      ipAddress,
      userAgent,
    };
    next();
  } catch (err) {
    next(err);
  }
};

// Khởi động OAuth flow
router.get(
  '/google',
  captureLoginInfo,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Xử lý callback từ Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Cập nhật IP và User Agent vào lần đăng nhập cuối cùng
      if (req.user && req.session.loginInfo) {
        const user = req.user;
        if (user.loginHistory && user.loginHistory.length > 0) {
          const lastLogin = user.loginHistory[user.loginHistory.length - 1];
          lastLogin.ipAddress = req.session.loginInfo.ipAddress;
          lastLogin.userAgent = req.session.loginInfo.userAgent;
          await user.save();
        }
      }

      // Tạo JWT token
      const token = generateToken(req.user);

      // Chuẩn bị dữ liệu user để gửi
      const userData = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar,
        loginCount: req.user.loginCount,
        lastLogin: req.user.lastLogin,
      };

      // Redirect về frontend với token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}?token=${token}&user=${JSON.stringify(userData)}`);
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
    
    // Trả về thông tin user (không bao gồm sensitive data)
    const userData = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isActive: user.isActive,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
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

// Lấy lịch sử đăng nhập của user
router.get('/login-history', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User không tìm thấy' });
    }

    // Sắp xếp theo thời gian gần nhất trước
    const loginHistory = user.loginHistory
      .sort((a, b) => new Date(b.loginAt) - new Date(a.loginAt))
      .slice(0, 20); // Lấy 20 lần đăng nhập gần nhất

    res.json({
      loginCount: user.loginCount,
      lastLogin: user.lastLogin,
      loginHistory,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;