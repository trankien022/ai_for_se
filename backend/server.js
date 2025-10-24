require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require('express-session');
const passport = require('passport');

// Khởi tạo express app
const app = express();

// Middleware - CORS cho phép nhiều origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5500',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép requests không có origin CHỈ trong local development
    // (requests từ file://, Postman, curl sẽ không có origin header)
    if (!origin) {
      // Chỉ cho phép no-origin requests khi chạy local (không phải staging/production)
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.log('⚠️ Allowing no-origin request (local development only)');
        return callback(null, true);
      } else {
        console.warn('⚠️ CORS blocked: no-origin request in ' + process.env.NODE_ENV);
        return callback(new Error('Not allowed by CORS'));
      }
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.FRONTEND_URL === origin) {
      callback(null, true);
    } else {
      // Thực sự block origin không được phép
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// Passport middleware
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://vehicles_rental:0504@rental.vhr9wrd.mongodb.net/vehicles_rental?appName=rental", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Kết nối MongoDB thành công"))
.catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Import routes
const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Lỗi server', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
