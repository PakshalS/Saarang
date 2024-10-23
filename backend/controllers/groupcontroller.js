const Group = require('../models/Group');
const User = require('../models/User');

// Create Group
const createGroup = async (req, res) => {
  try {
    console.log("Authenticated User:", req.user);  // Check if user data is correct

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { nanoid } = await import('nanoid/non-secure');
    const { name, groupType } = req.body;

    // Check if user already has an active group
    if (req.user.activeGroup) {
      return res.status(400).json({ message: 'You are already in an active group.' });
    }

    // Create a new group
    const groupCode = nanoid(8);  // Generate unique group code
    const group = new Group({
      name,
      groupCode,
      groupType,
      admin: req.user._id,  // Set admin to the authenticated user's MongoDB ID
      members: [req.user._id],  // Add the admin as the first member
      expiryTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 11 * 60 * 1000),  // 1 hr 11 min expiry
      chatLocked: false,  // Chat is open by default
    });

    await group.save();

    // Update user's active group reference
    req.user.activeGroup = group._id;
    await req.user.save();

    // Respond with success
    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating group",
      error: error.message,
    });
  }
};


const joinGroup = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      // Check if user is already part of an active group
      if (user.activeGroup) {
        return res.status(400).json({ message: 'You are already in an active group. Please leave it before joining another one.' });
      }
  
      const { groupCode } = req.body;
  
      // Find group by groupCode
      const group = await Group.findOne({ groupCode });
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Add user to group members
      group.members.push(req.user._id);
  
      // Save the group and update the user's active group
      await group.save();
      user.activeGroup = group._id;
      await user.save();
  
      res.status(200).json({ message: 'Joined group successfully', group });
    } catch (error) {
      res.status(500).json({
        message: 'Error joining group',
        error: error.message,
      });
    }
  };

  
  const leaveGroup = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      // Check if the user is part of an active group
      if (!user.activeGroup) {
        return res.status(400).json({ message: 'You are not currently in any group.' });
      }
  
      // Find the group the user is part of
      const group = await Group.findById(user.activeGroup);
  
      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }
  
      // Remove user from group members
      group.members = group.members.filter(member => member.toString() !== user._id.toString());
  
      // If the user is the admin and the last one in the group, delete the group
      if (group.members.length === 0) {
        await group.deleteOne();  // Use deleteOne to remove the group
      } else {
        await group.save();  // Save the updated group if there are still members
      }
  
      // Clear user's active group
      user.activeGroup = null;
      await user.save();
  
      res.status(200).json({ message: 'You have left the group successfully' });
    } catch (error) {
      res.status(500).json({
        message: 'Error leaving group',
        error: error.message,
      });
    }
  };
  

  module.exports ={
    createGroup,
    joinGroup,
    leaveGroup
  }