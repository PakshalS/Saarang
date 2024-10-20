const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },  // Group name
  groupCode: { type: String, unique: true }, // For private groups
  groupType: { type: String, enum: ['open', 'private'], required: true },  // Group type
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin of the group
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Group members
  expiryTime: { type: Date, required: true },  // Expiry time (1 hr 11 mins from creation)
  chatLocked: { type: Boolean, default: false },  // Admin can lock chat
  songQueue: [{ type: String }],  // List of Spotify track URIs for group queue
  userQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // User queue for turn-by-turn playback
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', groupSchema);
