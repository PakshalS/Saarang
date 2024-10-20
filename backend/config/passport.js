const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/User');  // Your User model

passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/spotify/callback" // Ensure this matches Spotify settings
},
  async function(accessToken, refreshToken, expires_in, profile, done) {
    try {
      // Check if the user already exists
      let user = await User.findOne({ spotifyId: profile.id });

      if (!user) {
        // If user doesn't exist, create a new one
        user = new User({
          spotifyId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0]?.value,
          accessToken,
          refreshToken
        });
        await user.save();
      } else {
        // If user exists, update tokens
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
