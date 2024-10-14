const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin user
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Group members
  groupCode: { type: String, required: true, unique: true }, // Unique group code to join
  groupType: { type: String, enum: ['shared', 'nonshared'], required: true }, // Type of group
  isChatLocked: { type: Boolean, default: false }, // If the chat is locked
  createdAt: { type: Date, default: Date.now, expires: '2h' }, // Temporary group, auto-deletes after 2 hours
  songsQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }], // Queue of songs to play
  currentSong: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' }, // Song currently being played
  likes: { 
    type: Map, 
    of: Number, 
    default: {} 
  } // Tracks likes per user, key is userId, value is number of likes
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
