const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/grouproutes');
require('dotenv').config();
require('./config/passport');  // Initialize passport strategy
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
// Middleware for session management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth routes
app.use('/auth', authRoutes);
app.use('/group',groupRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
});


app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/spotify');
  }
  res.send(`Welcome, ${req.user.displayName}!`);  // Access user info from Spotify profile
});

// Function to verify Spotify Access Token
const verifySpotifyToken = async (token) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // If successful, return the user data
    return response.data;
  } catch (error) {
    console.error('Token verification failed:', error.response?.data || error.message);
    return null;  // Return null if verification fails
  }
};