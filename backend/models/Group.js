const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: { type: String, required: true },  
  groupCode: { 
    type: String, unique: true, 
    required: function() 
    { return this.groupType === 'private'; }}, 
  groupType: { 
    type: String, 
    enum: ['open', 'private'], 
    required: true },  
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  expiryTime: { type: Date, required: true, default: () => new Date(Date.now() + 71 * 60000)},  
  chatLocked: { type: Boolean, default: false },  
  songQueue: [{ type: String  }],  
  userQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  createdAt: { type: Date, default: Date.now },
  maxMembers: {type: Number,default: 10, required: true},
  isExpired: { type: Boolean, default: false }});

// Before saving, ensure the group does not exceed the maximum member size
groupSchema.pre('save', function(next) {
  if (this.members.length > this.maxMembers) {
    return next(new Error('Group cannot exceed maximum size of 10 members'));
  }
  next();
});

module.exports = mongoose.model('Group', groupSchema);
