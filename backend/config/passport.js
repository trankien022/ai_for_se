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

          const newLoginEntry = {
            loginAt: new Date(),
            loginMethod: 'google',
            ipAddress: null, // Sẽ được cập nhật từ request middleware
            userAgent: null, // Sẽ được cập nhật từ request middleware
          };

          if (user) {
            // User đã tồn tại, cập nhật thông tin
            user.email = profile.emails[0].value;
            user.name = profile.displayName;
            user.firstName = profile.name?.givenName || '';
            user.lastName = profile.name?.familyName || '';
            user.avatar = profile.photos[0]?.value || user.avatar;
            
            // Cập nhật Google Profile
            user.googleProfile = {
              displayName: profile.displayName,
              photo: profile.photos[0]?.value || null,
              locale: profile._json?.locale || 'en',
              raw: profile._json,
            };

            // Cập nhật Google Tokens
            user.googleTokens = {
              accessToken: accessToken,
              refreshToken: refreshToken || user.googleTokens?.refreshToken,
              tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 giờ
            };

            // Cập nhật lịch sử đăng nhập
            user.loginHistory.push(newLoginEntry);
            user.lastLogin = new Date();
            user.loginCount = (user.loginCount || 0) + 1;
            user.isActive = true;
            user.updatedAt = new Date();

            await user.save();
            return done(null, user);
          }

          // Tạo user mới
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            avatar: profile.photos[0]?.value || null,
            
            // Google Profile
            googleProfile: {
              displayName: profile.displayName,
              photo: profile.photos[0]?.value || null,
              locale: profile._json?.locale || 'en',
              raw: profile._json,
            },

            // Google Tokens
            googleTokens: {
              accessToken: accessToken,
              refreshToken: refreshToken,
              tokenExpiry: new Date(Date.now() + 3600 * 1000), // 1 giờ
            },

            // Lịch sử đăng nhập
            loginHistory: [newLoginEntry],
            lastLogin: new Date(),
            loginCount: 1,
            isActive: true,
          });

          await user.save();
          return done(null, user);
        } catch (err) {
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
