const passport = require('passport');

// Spotify login handler
const spotifyLogin = passport.authenticate('spotify', {
  scope: ['user-read-email', 'playlist-read-private', 'user-library-read', 'user-read-private', 'user-read-playback-state', 'user-modify-playback-state']
});

// Spotify callback handler
const spotifyCallback = passport.authenticate('spotify', {
  failureRedirect: '/',
  successRedirect: '/dashboard' ,  // Redirect to login if the authorization code is invalid
  failureMessage: true  // Redirect to your app's dashboard on success
});


// Logout handler 
const logout = (req, res, next) => {
      req.session = null; 
      req.logout((err) => {
        if (err) {
          return next(err);  
        }
      console.log('User logged out, session destroyed, and cookie cleared');
    });
    res.redirect('/');
  }



module.exports = {
  spotifyLogin,
  spotifyCallback,
  logout,
};
