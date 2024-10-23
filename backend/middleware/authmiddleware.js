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

module.exports = ensureAuthenticated;
