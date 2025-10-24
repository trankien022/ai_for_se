const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Allow login with email or username (for admin)
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // For demo, compare plain password (in real app, hash)
    if (user.password !== password) return res.status(400).json({ message: 'Invalid password' });

    // Update login info
    user.lastLogin = new Date();
    user.loginCount += 1;
    user.loginHistory.push({
      loginAt: new Date(),
      loginMethod: user.email === email ? 'email' : 'username',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name || user.username,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

    // Create new user
    const newUser = new User({
      _id: new mongoose.Types.ObjectId().toString(),
      username,
      email,
      password, // In real app, hash the password
      name,
      role: 'user', // Default role
      loginHistory: [],
      loginCount: 0,
      isActive: true
    });

    await newUser.save();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;