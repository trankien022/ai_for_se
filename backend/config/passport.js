const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Tìm user theo googleId
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User đã tồn tại - chỉ cập nhật thông tin cơ bản nếu có thay đổi
            if (profile.emails && profile.emails[0]) {
              user.email = profile.emails[0].value.toLowerCase();
            }
            if (profile.displayName) {
              user.name = profile.displayName;
            }
            if (profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            // Đảm bảo authProvider được set đúng (quan trọng cho validation)
            if (!user.authProvider) {
              user.authProvider = 'google';
            }
            user.updatedAt = new Date();

            // Save - password validation sẽ tự động skip vì authProvider = 'google'
            // (xem User model: password required chỉ khi authProvider === 'username')
            await user.save();
            console.log('✅ User đã tồn tại:', user.email);
            return done(null, user);
          }

          // Tạo user mới - MINIMAL DATA ONLY
          user = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value?.toLowerCase() || null,
            name: profile.displayName || 'Google User',
            avatar: profile.photos?.[0]?.value || null,
            role: 'Customer',
            authProvider: 'google',
          });

          await user.save();
          console.log('✅ Tạo user mới từ Google:', user.email);
          return done(null, user);
        } catch (err) {
          console.error('❌ Lỗi Google OAuth:', err);
          return done(err, null);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
