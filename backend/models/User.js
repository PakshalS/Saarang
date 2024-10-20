const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  spotifyId: { type: String, required: true, unique: true }, // Spotify ID
  displayName: { type: String },  // Spotify username
  email: { type: String },        // Spotify email
  profileImage: { type: String }, // Spotify profile picture
  accessToken: { type: String },  // Spotify OAuth access token
  refreshToken: { type: String }, // Spotify OAuth refresh token
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Friends in your app
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Pending friend requests
  activeGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
