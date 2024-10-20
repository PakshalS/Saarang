const passport = require('passport');

// Spotify login handler
const spotifyLogin = passport.authenticate('spotify', {
  scope: ['user-read-email', 'playlist-read-private', 'user-library-read', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state']
});

// Spotify callback handler
const spotifyCallback = passport.authenticate('spotify', {
  failureRedirect: '/login',
  successRedirect: '/dashboard'  // Redirect to your app's dashboard on success
});

// Logout handler 
const logout = async (req, res, next) => {
  try {
    await req.logout((err) => {
      if (err) {
        throw err;
      }
    });

    await req.session.destroy((err) => {
      if (err) {
        throw err;
      }
      res.redirect('/');  // Redirect to homepage after successful logout
    });
  } catch (error) {
    next(error); 
  }
};

module.exports = {
  spotifyLogin,
  spotifyCallback,
  logout
};
