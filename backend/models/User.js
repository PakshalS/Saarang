const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Consider hashing passwords
  profilePicture: { type: String, default: '' }, // URL to the profile picture
  bio: { type: String, default: '' }, // User bio
  likesReceived: { type: Number, default: 0 }, // Number of likes received from other users
  playlists: [{ 
    name: String, 
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }] 
  }] // List of playlists created by the user
});

const User = mongoose.model('User', userSchema);
module.exports = User;
