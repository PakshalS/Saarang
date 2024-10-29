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

  
  // const leaveGroup = async (req, res) => {
  //   try {
  //     const user = await User.findById(req.user._id);
  
  //     // Check if the user is part of an active group
  //     if (!user.activeGroup) {
  //       return res.status(400).json({ message: 'You are not currently in any group.' });
  //     }
  
  //     // Find the group the user is part of
  //     const group = await Group.findById(user.activeGroup);
  
  //     if (!group) {
  //       return res.status(404).json({ message: 'Group not found' });
  //     }
  
  //     // Remove user from group members
  //     group.members = group.members.filter(member => member.toString() !== user._id.toString());
  
  //     // If the user is the admin and the last one in the group, delete the group
  //     if (group.members.length === 0) {
  //       await group.deleteOne();  // Use deleteOne to remove the group
  //     } else {
  //       await group.save();  // Save the updated group if there are still members
  //     }
  
  //     // Clear user's active group
  //     user.activeGroup = null;
  //     await user.save();
  
  //     res.status(200).json({ message: 'You have left the group successfully' });
  //   } catch (error) {
  //     res.status(500).json({
  //       message: 'Error leaving group',
  //       error: error.message,
  //     });
  //   }
  // };
  
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
  
      // Check if the user is the admin
      if (group.admin.toString() === user._id.toString()) {
        // If there are other members, transfer admin rights to the first member in the array
        if (group.members.length > 0) {
          group.admin = group.members[0]; // Assign admin to the next joined member
        } else {
          // If no members are left, delete the group
          await group.deleteOne();
        }
      }
  
      // Save the updated group if it still exists
      if (group.members.length > 0) {
        await group.save();
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
  
  const removeUserFromGroup = async (req, res) => {
    try {
      const { userId } = req.body; // ID of the user to remove
      const adminId = req.user._id; // ID of the current user (admin)
      
      const group = await Group.findById(req.user.activeGroup);
  
      // Check if the requester is the admin of the group
      if (!group || group.admin.toString() !== adminId.toString()) {
        return res.status(403).json({ message: 'Only the admin can remove members' });
      }
  
      // Check if the user is in the group
      if (!group.members.includes(userId)) {
        return res.status(404).json({ message: 'User not found in the group' });
      }
  
      // Remove the user from members
      group.members = group.members.filter(member => member.toString() !== userId);
  
      await group.save();
  
      // Clear the removed user's activeGroup if they're removed
      const removedUser = await User.findById(userId);
      removedUser.activeGroup = null;
      await removedUser.save();
  
      res.status(200).json({ message: 'User removed from the group successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error removing user from group', error: error.message });
    }
  };

  const transferAdminRights = async (req, res) => {
    try {
      const { newAdminId } = req.body; // ID of the new admin
  
      const group = await Group.findById(req.user.activeGroup);
  
      // Ensure the current user is the admin
      if (!group || group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the admin can transfer admin rights' });
      }
  
      // Ensure the new admin is part of the group
      if (!group.members.includes(newAdminId)) {
        return res.status(404).json({ message: 'User not found in the group' });
      }
  
      // Transfer admin rights
      group.admin = newAdminId;
      await group.save();
  
      res.status(200).json({ message: 'Admin rights transferred successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error transferring admin rights', error: error.message });
    }
  };
  
  const addUserFromFriends = async (req, res) => {
    try {
      const { friendId } = req.body; // ID of the friend to add
  
      const group = await Group.findById(req.user.activeGroup);
      const adminUser = await User.findById(req.user._id).populate('friends');
  
      // Ensure the current user is the admin
      if (!group || group.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the admin can add members' });
      }
  
      // Check if the friend exists and is actually a friend
      if (!adminUser.friends.some(friend => friend._id.toString() === friendId)) {
        return res.status(404).json({ message: 'User not found in friends list' });
      }
  
      // Check if the friend is already a member
      if (group.members.includes(friendId)) {
        return res.status(400).json({ message: 'User is already in the group' });
      }
  
      // Check if adding the friend would exceed the max group size
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ message: 'Group has reached its maximum member limit' });
      }
  
      // Add the friend to the group
      group.members.push(friendId);
      await group.save();
  
      // Update the friend’s active group
      const friendUser = await User.findById(friendId);
      friendUser.activeGroup = group._id;
      await friendUser.save();
  
      res.status(200).json({ message: 'Friend added to the group successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding friend to group', error: error.message });
    }
  };
  

  module.exports ={
    createGroup,
    joinGroup,
    leaveGroup,
    removeUserFromGroup,
    transferAdminRights,
    addUserFromFriends
  }