const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieSession = require('cookie-session');
const authRoutes = require('./routes/auth');
const groupRoutes = require('./routes/grouproutes');
require('dotenv').config();
require('./config/passport');  
const app = express();
const {isLoggedIn} = require('./middleware/authmiddleware')
const session = require('express-session');
app.use(express.json());

app.use(session({
  secret : process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Initial Route
// app.listen(process.env.PORT || 3000, () => {
//   console.log(`Server running on port ${process.env.PORT || 3000}`);
//   app.get('/', (req, res) => {
//     res.send('Hello, world!');
//   });
// });
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


// Redirect to login if user is not authenticated
app.get('/dashboard',isLoggedIn, (req, res) => {
  res.send(`Welcome, ${req.user.displayName}!`);
});