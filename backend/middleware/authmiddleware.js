const axios = require('axios');
const User = require('../models/User');

const ensureAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate the token by making a request to Spotify API
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const spotifyUserData = response.data;

    // Find the user in your MongoDB by spotifyId
    const user = await User.findOne({ spotifyId: spotifyUserData.id });

    if (!user) {
      return res.status(401).json({ message: 'User not found in the system' });
    }

    // Attach MongoDB user object to req.user
    req.user = user;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token or session expired' });
  }
};

const checkTokenValidity = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.accessToken) {
    return res.redirect('/auth/spotify'); // Redirect to login if not authenticated
  }

  try {
    // Verify if token is valid by attempting to access Spotify's API
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });
    next(); // Token is valid, proceed to the next middleware/route
  } catch (error) {
    // If token verification fails, redirect to login
    console.error('Token verification failed:', error.message);
    res.redirect('/auth/spotify');
  }
};

const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).send('Not Logged In');
  }
}

module.exports = 
{
  ensureAuthenticated,
  checkTokenValidity,
  isLoggedIn
}
