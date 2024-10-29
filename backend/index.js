const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/grouproutes');
const friendRoutes = require('./routes/friends');
require('dotenv').config();
require('./config/passport');
const { isLoggedIn } = require('./middleware/authmiddleware');
const session = require('express-session');
const setupSocket = require('./config/socket'); // Import the setupSocket function

const app = express();
const server = http.createServer(app);

// Configure session and Socket.IO
app.use(express.json());
app.use(session({
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

// Initialize Socket.IO
const io = setupSocket(server); // Pass the server to setupSocket

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Initial Route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Auth routes
app.use('/auth', authRoutes);
//Group routes
app.use('/group',groupRoutes);
//Friend Routes
app.use('/friend',friendRoutes);

// Redirect to login if user is not authenticated
app.get('/dashboard',isLoggedIn, (req, res) => {
  res.send(`Welcome, ${req.user.displayName}!`);
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
  app.get('/', (req, res) => {
    res.send('Hello, world!');
  });
});

module.exports = app; // or export default app if using ES modules
