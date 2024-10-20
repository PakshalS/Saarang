const chatSchema = new mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, // Group to which the chat belongs
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Sender of the message
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model('Chat', chatSchema);
  