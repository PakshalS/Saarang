const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const User = require('../models/User'); 

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

passport.use(new SpotifyStrategy({
  clientID: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/spotify/callback",
}, async function(accessToken, refreshToken, profile, done) {
  try {
    let user = await User.findOne({ spotifyId: profile.id });
    if (!user) {
      user = new User({
        spotifyId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0]?.value,
        profileImage: profile.photos[0]?.value,
        accessToken,
        refreshToken,
      });
      await user.save();
    } else {
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

