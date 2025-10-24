const jwt = require('jsonwebtoken');

// Tạo JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    googleId: user.googleId,
    avatar: user.avatar,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30m', // Token hết hạn sau 30 phút
  });
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
};

// Middleware để xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Không có token' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  req.user = decoded;
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
};
