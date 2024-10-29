const User = require('../models/User');

const sendFriendRequest = async(req, res) => {
    const { targetUserId } = req.body;
    const currentUser = req.user;
  
    if (currentUser._id.equals(targetUserId)) {
      return res.status(400).json({ error: "You can't send a friend request to yourself." });
    }
  
    try {
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) return res.status(404).json({ error: "User not found" });
  
      // Check if already friends or if a request exists
      if (targetUser.friends.includes(currentUser._id) || targetUser.friendRequests.includes(currentUser._id)) {
        return res.status(400).json({ error: "Friend request already sent or user is already your friend" });
      }
  
      targetUser.friendRequests.push(currentUser._id);
      await targetUser.save();
  
      res.status(200).json({ message: "Friend request sent" });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while sending the request" });
    }
}

const respondFriendRequest = async( req ,res) =>
{
    const { senderId, action } = req.body; // senderId: ID of user who sent request, action: 'accept' or 'reject'
    const currentUser = req.user;

  try {
    const sender = await User.findById(senderId);
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    // Verify request exists
    const requestIndex = currentUser.friendRequests.indexOf(senderId);
    if (requestIndex === -1) {
      return res.status(400).json({ error: "No friend request from this user" });
    }

    if (action === 'accept') {
      // Add each user to the other’s friends list
      currentUser.friends.push(senderId);
      sender.friends.push(currentUser._id);
    }

    // Remove from friendRequests regardless of action
    currentUser.friendRequests.splice(requestIndex, 1);
    await currentUser.save();
    await sender.save();

    res.status(200).json({ message: `Friend request ${action}ed` });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while responding to the request" });
  }
}

// controllers/friendController.js
const removeFriend = async (req, res) => {
    const { friendId } = req.body; // The ID of the friend to remove
    const currentUser = req.user;
  
    try {
      const friend = await User.findById(friendId);
      if (!friend) return res.status(404).json({ error: "User not found" });
  
      // Check if they are friends
      const currentUserFriendIndex = currentUser.friends.indexOf(friendId);
      const friendUserFriendIndex = friend.friends.indexOf(currentUser._id);
  
      if (currentUserFriendIndex === -1 || friendUserFriendIndex === -1) {
        return res.status(400).json({ error: "You are not friends with this user" });
      }
  
      // Remove each other from the friends list
      currentUser.friends.splice(currentUserFriendIndex, 1);
      friend.friends.splice(friendUserFriendIndex, 1);
  
      await currentUser.save();
      await friend.save();
  
      res.status(200).json({ message: "Friend removed successfully" });
    } catch (error) {
      res.status(500).json({ error: "An error occurred while removing the friend" });
    }
  };
  

module.exports = 
{
    removeFriend,
    sendFriendRequest,
    respondFriendRequest
}